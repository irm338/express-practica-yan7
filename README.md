# Express Práctica Yan7

API REST de productos construida con Node.js, Express y MySQL/MariaDB. Incluye operaciones CRUD, validación de entradas, consultas SQL parametrizadas y respuestas JSON consistentes.

## Tecnologías

- Node.js 20 o superior
- Express 5
- MySQL 8 o MariaDB compatible
- `mysql2` para conexiones y consultas parametrizadas
- `dotenv` para configuración local
- Pruebas con el módulo integrado `node:test`

## Estructura del proyecto

```text
.
├── app.js
├── db/
│   └── db.sql
├── docs/
│   └── mysql-setup.md
├── src/
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── products.controller.js
│   ├── models/
│   │   └── products.model.js
│   └── routes/
│       └── products.routes.js
├── test/
│   └── products.test.js
├── .env.example
├── .gitignore
└── package.json
```

## Requisitos

- Node.js 20 o superior y npm.
- Un servidor MySQL o MariaDB accesible desde la aplicación.

## Instalación y configuración

1. Instala las dependencias:

   ```sh
   npm install
   ```

2. Copia `.env.example` como `.env` y ajusta las credenciales:

   ```dotenv
   DB_NAME=express_practica
   DB_USER=root
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_PASSWORD=
   SERVER_PORT=3000
   ```

   `DB_NAME` y `DB_USER` son obligatorias. `DB_HOST`, `DB_PORT`, `DB_PASSWORD` y `SERVER_PORT` tienen valores predeterminados adecuados para desarrollo local. No compartas ni subas el archivo `.env`.

3. Crea y selecciona la base de datos, y después carga el esquema:

   ```sql
   CREATE DATABASE express_practica
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   USE express_practica;
   ```

   En la consola de MySQL, desde la raíz del proyecto:

   ```text
   SOURCE db/db.sql
   ```

   Consulta [docs/mysql-setup.md](docs/mysql-setup.md) para alternativas de carga y solución de problemas.

## Ejecución y pruebas

Inicia el servidor:

```sh
npm start
```

La API estará disponible en `http://localhost:3000` (o en el puerto indicado por `SERVER_PORT`). Ejecuta las pruebas HTTP y de validación con:

```sh
npm test
```

Las pruebas usan una base de datos simulada; no requieren una instancia MySQL activa.

## Endpoints

Todas las respuestas usan JSON. Los productos tienen las propiedades `id`, `name`, `description`, `price`, `stock`, `created_at` y `updated_at`. `price` puede serializarse como texto decimal según la configuración de MySQL.

| Método | Ruta | Resultado |
|---|---|---|
| `GET` | `/health` | Comprueba que el servidor HTTP está disponible. |
| `GET` | `/api/products` | Lista todos los productos. |
| `GET` | `/api/products/:id` | Obtiene un producto por identificador. |
| `POST` | `/api/products` | Crea un producto. |
| `PUT` | `/api/products/:id` | Reemplaza los datos editables de un producto. |
| `DELETE` | `/api/products/:id` | Elimina un producto. |

### Comprobar el servidor

Petición:

```http
GET /health
```

Respuesta `200 OK`:

```json
{ "status": "ok" }
```

### Listar productos

Petición:

```http
GET /api/products
```

Respuesta `200 OK`:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Teclado",
      "description": "Teclado mecánico",
      "price": "49.99",
      "stock": 12,
      "created_at": "2026-01-15T12:00:00.000Z",
      "updated_at": "2026-01-15T12:00:00.000Z"
    }
  ]
}
```

### Consultar un producto

Petición:

```http
GET /api/products/1
```

Respuesta `200 OK`:

```json
{
  "data": {
    "id": 1,
    "name": "Teclado",
    "description": "Teclado mecánico",
    "price": "49.99",
    "stock": 12,
    "created_at": "2026-01-15T12:00:00.000Z",
    "updated_at": "2026-01-15T12:00:00.000Z"
  }
}
```

Si no existe el identificador, responde `404 Not Found` con `{ "error": "Producto no encontrado." }`.

### Crear producto

Petición:

```http
POST /api/products
Content-Type: application/json

{
  "name": "Teclado",
  "description": "Teclado mecánico",
  "price": 49.99,
  "stock": 12
}
```

Respuesta `201 Created`:

```json
{
  "data": {
    "id": 1,
    "name": "Teclado",
    "description": "Teclado mecánico",
    "price": "49.99",
    "stock": 12,
    "created_at": "2026-01-15T12:00:00.000Z",
    "updated_at": "2026-01-15T12:00:00.000Z"
  }
}
```

`name` y `price` son obligatorios. `description` acepta texto o `null` y es opcional; `stock` es opcional y vale `0` por defecto. Se rechazan propiedades desconocidas, precios negativos o con más de dos decimales, existencias no enteras y cadenas fuera de los límites definidos en el controlador.

### Actualizar producto

Petición:

```http
PUT /api/products/1
Content-Type: application/json

{
  "name": "Teclado compacto",
  "description": "Distribución en español",
  "price": 54.5,
  "stock": 8
}
```

Respuesta `200 OK`:

```json
{
  "data": {
    "id": 1,
    "name": "Teclado compacto",
    "description": "Distribución en español",
    "price": "54.50",
    "stock": 8,
    "created_at": "2026-01-15T12:00:00.000Z",
    "updated_at": "2026-01-16T12:00:00.000Z"
  }
}
```

La validación y los campos son los mismos que en la creación. `PUT` reemplaza los datos editables; al omitir `description` se guarda `null` y al omitir `stock` se guarda `0`.

### Eliminar producto

Petición:

```http
DELETE /api/products/1
```

Respuesta `200 OK`:

```json
{ "message": "Producto eliminado correctamente." }
```

### Códigos de error

- `400 Bad Request`: JSON mal formado, identificador inválido o campos no válidos. La respuesta incluye `error` y, para errores de datos, `details`.
- `404 Not Found`: ruta o producto inexistente.
- `503 Service Unavailable`: conexión o credenciales de la base de datos no disponibles.
- `500 Internal Server Error`: error interno; el detalle técnico se registra en el servidor y no se devuelve al cliente.
