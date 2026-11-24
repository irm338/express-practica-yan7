-- Ejecuta este archivo después de seleccionar la base de datos configurada en DB_NAME.
-- Ejemplo previo en MySQL: CREATE DATABASE express_practica;
-- Después selecciona esa base con: USE express_practica;

-- Crea la tabla que consume src/models/products.model.js.
CREATE TABLE IF NOT EXISTS products (
  -- Identificador autoincremental que coincide con INT UNSIGNED en la API.
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Nombre requerido del producto, limitado a 150 caracteres.
  name VARCHAR(150) NOT NULL,
  -- Descripción opcional, con el máximo de entrada validado por la API.
  description TEXT NULL,
  -- Precio no negativo con dos decimales, tal como valida el controlador.
  price DECIMAL(10, 2) NOT NULL,
  -- Existencias no negativas; el controlador aplica el límite UNSIGNED.
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  -- Fechas administradas automáticamente por MySQL.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;