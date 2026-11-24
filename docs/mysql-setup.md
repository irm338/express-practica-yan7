# Configuración de MySQL/MariaDB

## Preparar el esquema

El archivo [`../db/db.sql`](../db/db.sql) crea la tabla `products` dentro de la base de datos seleccionada. No crea una base de datos porque el nombre debe coincidir con `DB_NAME` en `.env`.

En el cliente de MySQL:

```sql
CREATE DATABASE express_practica
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE express_practica;
SOURCE db/db.sql
```

En PowerShell también se puede enviar el archivo al cliente de línea de comandos desde la raíz del proyecto:

```powershell
Get-Content .\db\db.sql | mysql --host=127.0.0.1 --port=3306 --user=root --password express_practica
```

Reemplaza host, puerto, usuario y nombre de base de datos según tu instalación. El cliente solicitará la contraseña de manera interactiva.

## Correspondencia entre SQL y la API

| Columna | Tipo SQL | Uso en la API |
|---|---|---|
| `id` | `INT UNSIGNED AUTO_INCREMENT` | Identificador positivo de hasta 4294967295. |
| `name` | `VARCHAR(150)` | Nombre obligatorio, recortado y limitado a 150 caracteres. |
| `description` | `TEXT NULL` | Descripción opcional de hasta 2000 caracteres. |
| `price` | `DECIMAL(10, 2)` | Número no negativo con hasta dos decimales. |
| `stock` | `INT UNSIGNED` | Número entero no negativo; por defecto es `0`. |
| `created_at` | `TIMESTAMP` | Fecha de creación asignada por MySQL. |
| `updated_at` | `TIMESTAMP` | Fecha de modificación actualizada por MySQL. |

Las consultas están en `src/models/products.model.js` y todas las entradas variables se envían como parámetros de `mysql2`.

## Solución de problemas

- Verifica que `DB_NAME`, `DB_USER`, `DB_HOST` y `DB_PORT` correspondan al servidor disponible.
- Si aparece `ER_ACCESS_DENIED_ERROR`, comprueba el usuario, la contraseña y los permisos para acceder a `DB_NAME`.
- Si aparece `ECONNREFUSED`, inicia MySQL/MariaDB o corrige el host y puerto.
- Confirma que el usuario tenga permiso para leer, insertar, actualizar y eliminar registros de `products`.
