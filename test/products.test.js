// Usa el test runner y las aserciones incluidos en Node.js.
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'node:http';
import { createApp } from '../src/app.js';

// Proporciona un pool en memoria con la misma interfaz ejecutada por el modelo.
function createMemoryDatabase() {
  const products = [];
  let nextId = 1;

  return {
    products,
    async execute(sql, parameters = []) {
      if (sql.startsWith('SELECT') && sql.includes('ORDER BY')) {
        return [products.map((product) => ({ ...product })), []];
      }

      if (sql.startsWith('SELECT')) {
        const product = products.find((item) => item.id === Number(parameters[0]));
        return [product ? [{ ...product }] : [], []];
      }

      if (sql.startsWith('INSERT')) {
        const [name, description, price, stock] = parameters;
        const id = nextId++;
        const now = new Date().toISOString();
        products.push({ id, name, description, price: price.toFixed(2), stock, created_at: now, updated_at: now });
        return [{ insertId: id, affectedRows: 1 }, []];
      }

      if (sql.startsWith('UPDATE')) {
        const [name, description, price, stock, id] = parameters;
        const product = products.find((item) => item.id === Number(id));

        if (product) {
          Object.assign(product, { name, description, price: price.toFixed(2), stock, updated_at: new Date().toISOString() });
        }

        return [{ affectedRows: product ? 1 : 0 }, []];
      }

      if (sql.startsWith('DELETE')) {
        const index = products.findIndex((item) => item.id === Number(parameters[0]));

        if (index === -1) {
          return [{ affectedRows: 0 }, []];
        }

        products.splice(index, 1);
        return [{ affectedRows: 1 }, []];
      }

      throw new Error(`Consulta de prueba no reconocida: ${sql}`);
    },
  };
}

// Inicia una app HTTP real sobre el modelo en memoria para probar el contrato completo.
const database = createMemoryDatabase();
const server = createServer(createApp(database));
let baseUrl;

before(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

// Comprueba la respuesta de estado y las cinco operaciones CRUD.
test('health y ciclo CRUD de productos devuelven los códigos y datos esperados', async () => {
  const healthResponse = await fetch(`${baseUrl}/health`);
  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), { status: 'ok' });

  const createResponse = await fetch(`${baseUrl}/api/products`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: ' Teclado ', description: 'Mecánico', price: 49.99, stock: 12 }),
  });
  assert.equal(createResponse.status, 201);
  const created = (await createResponse.json()).data;
  assert.equal(created.id, 1);
  assert.equal(created.name, 'Teclado');
  assert.equal(created.price, '49.99');

  const listResponse = await fetch(`${baseUrl}/api/products`);
  assert.equal(listResponse.status, 200);
  assert.equal((await listResponse.json()).data.length, 1);

  const getResponse = await fetch(`${baseUrl}/api/products/1`);
  assert.equal(getResponse.status, 200);
  assert.equal((await getResponse.json()).data.description, 'Mecánico');

  const updateResponse = await fetch(`${baseUrl}/api/products/1`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Teclado compacto', price: 54.5 }),
  });
  assert.equal(updateResponse.status, 200);
  const updated = (await updateResponse.json()).data;
  assert.equal(updated.name, 'Teclado compacto');
  assert.equal(updated.description, null);
  assert.equal(updated.stock, 0);

  const deleteResponse = await fetch(`${baseUrl}/api/products/1`, { method: 'DELETE' });
  assert.equal(deleteResponse.status, 200);
  assert.deepEqual(await deleteResponse.json(), { message: 'Producto eliminado correctamente.' });
});

// Comprueba que entradas inválidas y recursos inexistentes produzcan errores HTTP adecuados.
test('rechaza datos inválidos, identificadores erróneos y productos inexistentes', async () => {
  const invalidBodyResponse = await fetch(`${baseUrl}/api/products`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: '', price: -1, stock: 1.5, extra: true }),
  });
  assert.equal(invalidBodyResponse.status, 400);
  assert.ok((await invalidBodyResponse.json()).details.length > 0);

  const invalidIdResponse = await fetch(`${baseUrl}/api/products/0`);
  assert.equal(invalidIdResponse.status, 400);

  const missingProductResponse = await fetch(`${baseUrl}/api/products/999`);
  assert.equal(missingProductResponse.status, 404);
  assert.deepEqual(await missingProductResponse.json(), { error: 'Producto no encontrado.' });

  const missingRouteResponse = await fetch(`${baseUrl}/unknown`);
  assert.equal(missingRouteResponse.status, 404);
});

// Comprueba que JSON mal formado se traduzca a un 400 en lugar de una respuesta interna.
test('responde 400 cuando el cuerpo JSON está mal formado', async () => {
  const response = await fetch(`${baseUrl}/api/products`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{"name":',
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'El cuerpo JSON no es válido.' });
});
