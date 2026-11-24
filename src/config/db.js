// Lee los valores de .env al iniciar la aplicación.
import 'dotenv/config';
import mysql from 'mysql2/promise';

// El nombre de la base y el usuario deben declararse para evitar conexiones ambiguas.
const requiredVariables = ['DB_NAME', 'DB_USER'];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  throw new Error(`Faltan variables de entorno requeridas: ${missingVariables.join(', ')}`);
}

// Valida el puerto antes de pasarlo al controlador de MySQL.
const databasePort = Number(process.env.DB_PORT ?? '3306');

if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535) {
  throw new Error('DB_PORT debe ser un puerto válido entre 1 y 65535.');
}

// Mantiene conexiones reutilizables y consultas parametrizadas mediante mysql2.
export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: databasePort,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});