// Ejecuta las consultas SQL de productos con parámetros para evitar inyección SQL.
const PRODUCT_COLUMNS = 'id, name, description, price, stock, created_at, updated_at';

// Recupera los productos en un orden estable para respuestas reproducibles.
export async function findAll(database) {
  const [rows] = await database.execute(
    `SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY id ASC`,
  );
  return rows;
}

// Busca un único producto por clave primaria.
export async function findById(database, id) {
  const [rows] = await database.execute(
    `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

// Inserta un producto y recupera su representación persistida desde MySQL.
export async function create(database, product) {
  const [result] = await database.execute(
    'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
    [product.name, product.description, product.price, product.stock],
  );
  return findById(database, result.insertId);
}

// Actualiza los campos editables y devuelve null si no existe el identificador.
export async function update(database, id, product) {
  await database.execute(
    'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
    [product.name, product.description, product.price, product.stock, id],
  );
  return findById(database, id);
}

// Informa si la consulta eliminó un registro.
export async function remove(database, id) {
  const [result] = await database.execute('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
