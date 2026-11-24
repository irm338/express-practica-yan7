// Reúne las rutas de la API y el manejo común de solicitudes y errores.
import express from 'express';
import { productRoutes } from './routes/products.routes.js';

// Crea una aplicación con el pool recibido, lo que permite probar rutas sin MySQL.
export function createApp(database) {
  const app = express();

  // Analiza JSON y rechaza cuerpos que superen el tamaño previsto para la API.
  app.use(express.json({ limit: '100kb' }));

  // Informa si el proceso HTTP está disponible, sin consultar la base de datos.
  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });

  // Expone las operaciones CRUD de productos bajo una ruta versionable.
  app.use('/api/products', productRoutes(database));

  // Devuelve una respuesta JSON consistente para rutas que no existen.
  app.use((_request, response) => {
    response.status(404).json({ error: 'Ruta no encontrada.' });
  });

  // Convierte errores de validación, análisis JSON y base de datos en respuestas seguras.
  app.use((error, _request, response, _next) => {
    const status = Number.isInteger(error.status) ? error.status : 500;
    const isDatabaseUnavailable = [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'PROTOCOL_CONNECTION_LOST',
      'ER_ACCESS_DENIED_ERROR',
    ].includes(error.code);
    const responseStatus = isDatabaseUnavailable ? 503 : status;

    if (responseStatus >= 500) {
      console.error('Error al procesar la solicitud:', error);
    }

    if (error.type === 'entity.parse.failed') {
      return response.status(400).json({ error: 'El cuerpo JSON no es válido.' });
    }

    if (error.details) {
      return response.status(responseStatus).json({
        error: error.message,
        details: error.details,
      });
    }

    if (responseStatus === 503) {
      return response.status(503).json({
        error: 'La base de datos no está disponible.',
      });
    }

    return response.status(responseStatus).json({
      error: responseStatus >= 500 ? 'Error interno del servidor.' : error.message,
    });
  });

  return app;
}
