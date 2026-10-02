# CortexPulse AI - API Specifications (v1)

## Base URL
- Local Development: `http://localhost:8000/api/v1`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Active Endpoints

### 1. Health & Status
- **Endpoint**: `GET /api/v1/health`
- **Description**: Returns operational health, system status, timestamp, and database connectivity.

### 2. Authentication & Roles
- **Endpoint**: `GET /api/v1/auth/me` (Bearer Token Required)
- **Endpoint**: `GET /api/v1/auth/seller-only` (Requires `SELLER` or `ADMIN` role)
- **Endpoint**: `GET /api/v1/auth/admin-only` (Requires `ADMIN` role)

### 3. Categories
- **Endpoint**: `GET /api/v1/categories`
- **Description**: Lists all active catalog categories with display orders and descriptions.

### 4. Products (Customer Catalog)
- **Endpoint**: `GET /api/v1/products`
  - Query parameters:
    - `category`: Filter by category slug or ID
    - `search`: Query string for title, description, brand, or tags
    - `sort_by`: `newest`, `price_asc`, `price_desc`, `rating`
    - `page`: Page index (default: 1)
    - `page_size`: Items per page (default: 12)
  - Returns paginated `ProductListResponse` (`items`, `total`, `page`, `page_size`, `total_pages`).
- **Endpoint**: `GET /api/v1/products/{product_id}`
  - Returns complete `ProductResponse` with multi-image gallery, inventory stock counts, merchant details, technical specifications, and customer reviews.
- **Endpoint**: `POST /api/v1/products/{product_id}/reviews`
  - Body: `{"rating": 1-5, "title": "...", "comment": "..."}`
  - Adds verified review and updates product average rating.

### 5. Seller Product Management
- **Endpoint**: `GET /api/v1/seller/products` (Requires `SELLER` or `ADMIN` role)
  - Returns merchant's products with inventory levels and status (`draft`, `published`, `archived`).
- **Endpoint**: `POST /api/v1/seller/products` (Requires `SELLER` or `ADMIN` role)
  - Validates and creates a new product with stock quantity, compare-at discount price, brand, SKU, and specifications.
- **Endpoint**: `PUT /api/v1/seller/products/{product_id}` (Requires `SELLER` or `ADMIN` role)
  - Modifies existing product fields, prices, and inventory stock.
- **Endpoint**: `DELETE /api/v1/seller/products/{product_id}` (Requires `SELLER` or `ADMIN` role)
  - Removes product from the marketplace.
- **Endpoint**: `POST /api/v1/upload/image` (Requires `SELLER` or `ADMIN` role)
  - Multipart image upload returning public storage media URL.
