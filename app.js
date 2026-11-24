// Carga la configuración local de .env antes de crear el pool de conexiones.
import 'dotenv/config';

// Importa la aplicación HTTP y el pool compartido de MySQL.
import { createApp } from './src/app.js';
import { pool } from './src/config/db.js';

// Usa el puerto configurado o el puerto de desarrollo predeterminado.
const port = Number(process.env.SERVER_PORT ?? '3000');

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('SERVER_PORT debe ser un puerto válido entre 1 y 65535.');
}

// Inicia el servidor y conserva una referencia para un cierre controlado.
const server = createApp(pool).listen(port, () => {
  console.log(`Servidor disponible en http://localhost:${port}`);
});

// Cierra el servidor y el pool al recibir una señal de terminación.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(async (error) => {
      if (error) {
        console.error('No se pudo cerrar el servidor correctamente:', error);
        process.exitCode = 1;
      }

      try {
        await pool.end();
      } catch (poolError) {
        console.error('No se pudo cerrar el pool de MySQL:', poolError);
        process.exitCode = 1;
      }
    });
  });
}
