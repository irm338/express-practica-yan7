// Asocia cada verbo HTTP con la operación correspondiente del controlador.
import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  replaceProduct,
} from '../controllers/products.controller.js';

// Crea las rutas CRUD con el acceso a datos inyectado por la aplicación.
export function productRoutes(database) {
  const router = Router();

  router.get('/', listProducts(database));
  router.get('/:id', getProduct(database));
  router.post('/', createProduct(database));
  router.put('/:id', replaceProduct(database));
  router.delete('/:id', deleteProduct(database));

  return router;
}
