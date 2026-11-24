// Centraliza la validación de entrada y traduce los resultados del modelo a HTTP.
import {
  create,
  findAll,
  findById,
  remove,
  update,
} from '../models/products.model.js';

// Error con código HTTP y detalles que el middleware puede serializar.
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Asegura que los identificadores coincidan con el tipo INT UNSIGNED de MySQL.
function parseProductId(value) {
  const id = Number(value);

  if (!/^[1-9]\d*$/.test(value) || !Number.isInteger(id) || id > 4294967295) {
    throw new HttpError(400, 'El identificador debe ser un entero positivo válido.');
  }

  return id;
}

// Comprueba los campos del producto y devuelve únicamente los valores permitidos.
function validateProduct(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'El cuerpo debe ser un objeto JSON.');
  }

  const allowedFields = new Set(['name', 'description', 'price', 'stock']);
  const unknownFields = Object.keys(body).filter((field) => !allowedFields.has(field));

  if (unknownFields.length > 0) {
    throw new HttpError(400, 'El cuerpo contiene campos no permitidos.', unknownFields);
  }

  const errors = [];
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (name.length === 0 || name.length > 150) {
    errors.push('name es obligatorio y debe tener entre 1 y 150 caracteres.');
  }

  const description = body.description === undefined ? null : body.description;

  if (description !== null && typeof description !== 'string') {
    errors.push('description debe ser texto o null.');
  } else if (typeof description === 'string' && description.length > 2000) {
    errors.push('description no puede superar los 2000 caracteres.');
  }

  const price = body.price;

  if (
    typeof price !== 'number'
    || !Number.isFinite(price)
    || price < 0
    || price > 99999999.99
    || Number(price.toFixed(2)) !== price
  ) {
    errors.push('price debe ser un número entre 0 y 99999999.99 con hasta 2 decimales.');
  }

  const stock = body.stock === undefined ? 0 : body.stock;

  if (!Number.isInteger(stock) || stock < 0 || stock > 4294967295) {
    errors.push('stock debe ser un entero entre 0 y 4294967295.');
  }

  if (errors.length > 0) {
    throw new HttpError(400, 'Los datos del producto no son válidos.', errors);
  }

  return { name, description, price, stock };
}

// Devuelve todos los productos ordenados por identificador.
export function listProducts(database) {
  return async (_request, response) => {
    const products = await findAll(database);
    response.status(200).json({ data: products });
  };
}

// Busca un producto y devuelve 404 cuando no existe.
export function getProduct(database) {
  return async (request, response) => {
    const product = await findById(database, parseProductId(request.params.id));

    if (!product) {
      throw new HttpError(404, 'Producto no encontrado.');
    }

    response.status(200).json({ data: product });
  };
}

// Valida e inserta el producto, devolviendo el registro creado.
export function createProduct(database) {
  return async (request, response) => {
    const product = validateProduct(request.body);
    const createdProduct = await create(database, product);
    response.status(201).json({ data: createdProduct });
  };
}

// Reemplaza los datos editables del producto identificado.
export function replaceProduct(database) {
  return async (request, response) => {
    const id = parseProductId(request.params.id);
    const product = validateProduct(request.body);
    const updatedProduct = await update(database, id, product);

    if (!updatedProduct) {
      throw new HttpError(404, 'Producto no encontrado.');
    }

    response.status(200).json({ data: updatedProduct });
  };
}

// Elimina el producto o informa que el identificador no existe.
export function deleteProduct(database) {
  return async (request, response) => {
    const deleted = await remove(database, parseProductId(request.params.id));

    if (!deleted) {
      throw new HttpError(404, 'Producto no encontrado.');
    }

    response.status(200).json({ message: 'Producto eliminado correctamente.' });
  };
}
