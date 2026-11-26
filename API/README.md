# Documentación de endpoints

Todas las respuestas están en formato JSON. No se requiere autenticación.

## GET /categories

Obtiene todas las categorías disponibles.

**Respuesta exitosa — 200 OK**

```json
[
  {
    "id": 1,
    "name": "Tecnología",
    "description": "Dispositivos y accesorios tecnológicos.",
    "image_url": "https://ejemplo.com/tecnologia.jpg"
  },
  {
    "id": 2,
    "name": "Libros",
    "description": "Lecturas de distintos géneros y autores.",
    "image_url": "https://ejemplo.com/libros.jpg"
  }
]
```

**Uso en React Native:** llenar las tarjetas de la pantalla principal. Cada tarjeta puede utilizar `id`, `name` e `image_url`.

## GET /categories/{category_id}/products

Obtiene todos los productos pertenecientes a una categoría.

**Parámetro de ruta:**
- `category_id` (integer): identificador de la categoría seleccionada.

**Ejemplo:**

```http
GET /categories/1/products
```

**Respuesta exitosa — 200 OK**

```json
[
  {
    "id": 1,
    "category_id": 1,
    "name": "Audífonos inalámbricos",
    "description": "Audífonos Bluetooth con estuche de carga.",
    "price": 899.0,
    "image_url": "https://ejemplo.com/audifonos.jpg"
  }
]
```

**Uso en React Native:** cuando el usuario presione una categoría, navegar a la pantalla de productos y enviar el `id` de esa categoría en la URL.

**Error — 404 Not Found**

```json
{
  "detail": "Categoría no encontrada"
}
```

Se devuelve cuando el identificador de categoría no existe.

## GET /products/{product_id}

Obtiene la información de un producto específico.

**Parámetro de ruta:**
- `product_id` (integer): identificador del producto.

**Ejemplo:**

```http
GET /products/1
```

**Respuesta exitosa — 200 OK**

```json
{
  "id": 1,
  "category_id": 1,
  "name": "Audífonos inalámbricos",
  "description": "Audífonos Bluetooth con estuche de carga.",
  "price": 899.0,
  "image_url": "https://ejemplo.com/audifonos.jpg"
}
```

**Error — 404 Not Found**

```json
{
  "detail": "Producto no encontrado"
}
```

---

# Ejemplo de integración en React Native

Centralizar la dirección de la API en un solo archivo:

```javascript
// api.js
export const API_URL = "http://192.168.1.105:8000";

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener las categorías");
  }

  return await response.json();
}

export async function getProducts(categoryId) {
  const response = await fetch(
    `${API_URL}/categories/${categoryId}/products`
  );

  if (!response.ok) {
    throw new Error("No se pudieron obtener los productos");
  }

  return await response.json();
}
```

Ejemplo de uso:

```javascript
const categories = await getCategories();

// Al seleccionar una categoría:
const products = await getProducts(category.id);
```

## Relación entre las pantallas y la API

| Pantalla / acción | Endpoint |
|---|---|
| Abrir pantalla principal | `GET /categories` |
| Seleccionar una categoría | `GET /categories/{id}/products` |
| Consultar un producto (opcional) | `GET /products/{id}` |

## Notas importantes

- Los identificadores son enteros y los genera SQLite automáticamente.
- `category_id` relaciona cada producto con su categoría.
- `price` representa el precio en pesos mexicanos (MXN).
- `image_url` contiene una dirección de imagen que React Native puede utilizar en un componente `Image`.
- La API solo expone operaciones de lectura porque los requisitos actuales no necesitan crear, modificar ni eliminar registros.
- Los datos de ejemplo pueden modificarse directamente en SQLite o en la función `seed_database()` de `main.py`.
- La base de datos `catalogo.db` se genera localmente y no debe crearse manualmente.
