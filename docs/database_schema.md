# CortexPulse AI — Database Schema & Architecture

## Overview
The CortexPulse AI database is built on **PostgreSQL** hosted via **Supabase**. It is designed with high data integrity, strict referential constraints, optimized indexing for telemetry, and direct integration with **Supabase Auth** (`auth.users`).

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    users ||--o| seller_profiles : "has"
    users ||--o| customer_profiles : "has"
    users ||--o{ user_interactions : "generates"
    
    categories ||--o{ categories : "subcategories"
    categories ||--o{ products : "classifies"
    categories ||--o{ user_interactions : "categorizes"
    
    seller_profiles ||--o{ products : "lists"
    seller_profiles ||--o{ order_items : "fulfills"
    
    products ||--o{ product_images : "contains"
    products ||--|| inventory : "tracks"
    products ||--o{ cart_items : "referenced in"
    products ||--o{ order_items : "sold in"
    products ||--o{ reviews : "reviewed in"
    products ||--o{ wishlist_items : "saved in"
    products ||--o{ user_interactions : "target of"
    
    customer_profiles ||--o{ carts : "owns"
    customer_profiles ||--o{ orders : "places"
    customer_profiles ||--o{ reviews : "writes"
    customer_profiles ||--o| wishlists : "creates"
    
    carts ||--o{ cart_items : "contains"
    
    orders ||--o{ order_items : "composed of"
    orders ||--o{ payments : "paid by"
    orders ||--o{ reviews : "referenced in"
    
    wishlists ||--o{ wishlist_items : "stores"
```

---

## 2. Table Specifications & Relationships

### Identity & Profiles
#### 1. `users`
- **Purpose**: System user record linked directly to Supabase Auth (`auth.users.id`).
- **Columns**:
  - `id` (UUID, PK) — Matches Supabase `auth.users.id`.
  - `email` (VARCHAR(255), UNIQUE, NOT NULL)
  - `role` (VARCHAR(50), NOT NULL) — `customer`, `seller`, `admin`, `superadmin`.
  - `is_active` (BOOLEAN, default TRUE)
  - `is_verified` (BOOLEAN, default FALSE)
  - `created_at`, `updated_at` (TIMESTAMPTZ)
- **Security Note**: No passwords stored in application tables; handled exclusively by Supabase Auth cryptographic engine.

#### 2. `seller_profiles`
- **Purpose**: Merchant storefront identity, business verification, and payout configuration.
- **Foreign Keys**: `user_id` -> `users(id)` ON DELETE CASCADE.
- **Key Fields**: `store_name`, `store_slug` (UNIQUE), `description`, `logo_url`, `banner_url`, `business_email`, `business_phone`, `tax_id`, `rating` (NUMERIC 3,2), `review_count`, `is_verified`, `payout_account_id`, `metadata` (JSONB).

#### 3. `customer_profiles`
- **Purpose**: Buyer profile, default shipping/billing addresses, and AI preference flags.
- **Foreign Keys**: `user_id` -> `users(id)` ON DELETE CASCADE.
- **Key Fields**: `first_name`, `last_name`, `avatar_url`, `phone`, `default_shipping_address` (JSONB), `default_billing_address` (JSONB), `preferences` (JSONB).

---

### Catalog & Merchandising
#### 4. `categories`
- **Purpose**: Hierarchical marketplace taxonomy.
- **Foreign Keys**: `parent_id` -> `categories(id)` ON DELETE SET NULL (self-referencing tree).
- **Key Fields**: `name`, `slug` (UNIQUE), `description`, `image_url`, `display_order`, `is_active`, `metadata` (JSONB).

#### 5. `products`
- **Purpose**: Central marketplace product catalog item.
- **Foreign Keys**:
  - `seller_id` -> `seller_profiles(id)` ON DELETE CASCADE.
  - `category_id` -> `categories(id)` ON DELETE SET NULL.
- **Key Fields**: `title`, `slug` (UNIQUE), `description`, `price` (NUMERIC 12,2), `compare_at_price`, `cost_per_item`, `sku`, `barcode`, `status` (`draft`, `published`, `archived`), `is_featured`, `attributes` (JSONB), `tags` (TEXT[]), `avg_rating`, `review_count`.
- **Indexes**: GIN on `tags`, GIN on `attributes`, B-tree on `price`, `avg_rating`, `status`, `seller_id`.

#### 6. `product_images`
- **Purpose**: Media gallery and thumbnail management for product pages.
- **Foreign Keys**: `product_id` -> `products(id)` ON DELETE CASCADE.
- **Key Fields**: `image_url`, `alt_text`, `display_order`, `is_thumbnail`.

#### 7. `inventory`
- **Purpose**: Real-time stock counts, reservations, and low-stock telemetry alerts.
- **Foreign Keys**: `product_id` -> `products(id)` ON DELETE CASCADE (UNIQUE 1-to-1).
- **Key Fields**: `quantity_on_hand`, `reserved_quantity`, `low_stock_threshold`, `sku`.
- **Constraint**: `CHECK (reserved_quantity <= quantity_on_hand)`.

---

### Commerce & Ordering
#### 8. `carts`
- **Purpose**: Active shopping carts for both authenticated customers and guest sessions.
- **Foreign Keys**: `customer_id` -> `customer_profiles(id)` ON DELETE CASCADE (NULL for guests).
- **Key Fields**: `session_token` (VARCHAR for guest tracking), `status` (`active`, `abandoned`, `converted`).
- **Constraint**: Must have either `customer_id` or `session_token`.

#### 9. `cart_items`
- **Purpose**: Line items inside shopping carts.
- **Foreign Keys**:
  - `cart_id` -> `carts(id)` ON DELETE CASCADE.
  - `product_id` -> `products(id)` ON DELETE CASCADE.
- **Constraint**: `UNIQUE (cart_id, product_id)` ensures idempotency.

#### 10. `orders`
- **Purpose**: Confirmed customer purchases.
- **Foreign Keys**: `customer_id` -> `customer_profiles(id)` ON DELETE RESTRICT (preserves financial audit trail).
- **Key Fields**: `order_number` (UNIQUE), `status` (`pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`), `currency`, `subtotal`, `tax_amount`, `shipping_amount`, `discount_amount`, `total_amount`, `shipping_address` (JSONB), `billing_address` (JSONB), `tracking_number`.

#### 11. `order_items`
- **Purpose**: Granular order items with multi-seller attribution for split merchant fulfillment.
- **Foreign Keys**:
  - `order_id` -> `orders(id)` ON DELETE CASCADE.
  - `product_id` -> `products(id)` ON DELETE RESTRICT.
  - `seller_id` -> `seller_profiles(id)` ON DELETE RESTRICT.
- **Key Fields**: `quantity`, `unit_price`, `total_price`, `status`.

#### 12. `payments`
- **Purpose**: Payment gateway settlement transactions.
- **Foreign Keys**: `order_id` -> `orders(id)` ON DELETE RESTRICT.
- **Key Fields**: `provider` (`stripe`, `supabase`, `paypal`, `mock`), `transaction_id` (UNIQUE), `amount`, `currency`, `status` (`pending`, `completed`, `failed`, `refunded`), `payment_method`, `gateway_response` (JSONB).

---

### Engagement & Feedback
#### 13. `reviews`
- **Purpose**: Verified product feedback and rating calculations.
- **Foreign Keys**:
  - `product_id` -> `products(id)` ON DELETE CASCADE.
  - `customer_id` -> `customer_profiles(id)` ON DELETE CASCADE.
  - `order_id` -> `orders(id)` ON DELETE SET NULL.
- **Constraints**:
  - `CHECK (rating >= 1 AND rating <= 5)`
  - `UNIQUE (product_id, customer_id)` prevents review spamming.

#### 14. `wishlists`
- **Purpose**: Customer favorite collections.
- **Foreign Keys**: `customer_id` -> `customer_profiles(id)` ON DELETE CASCADE (1-to-1 default).
- **Key Fields**: `name`, `is_public`.

#### 15. `wishlist_items`
- **Purpose**: Products saved into customer wishlists.
- **Foreign Keys**:
  - `wishlist_id` -> `wishlists(id)` ON DELETE CASCADE.
  - `product_id` -> `products(id)` ON DELETE CASCADE.
- **Constraint**: `UNIQUE (wishlist_id, product_id)`.

---

### AI Telemetry & Behavioral Graph
#### 16. `user_interactions`
- **Purpose**: High-throughput behavioral event log driving machine learning features:
  - Collaborative filtering & matrix factorization.
  - Next-best-offer recommendation inference.
  - Customer purchase intent vector scoring.
  - Autonomous marketing re-engagement triggers.
- **Interaction Types**:
  - `product_view`: Customer viewed a product detail page.
  - `product_click`: Clicked a product card in a carousel or search result.
  - `search`: Executed a search query (stores query string and duration).
  - `add_to_cart`: High-intent add event.
  - `remove_from_cart`: Cart modification telemetry.
  - `wishlist`: Product saved to wishlist.
  - `purchase`: Conversion event.
  - `review`: Feedback submitted.
- **Fields**:
  - `id` (UUID, PK)
  - `user_id` (UUID, FK -> `users(id)`, nullable for anonymous visitors)
  - `session_id` (VARCHAR(255), NOT NULL, consistent browser session key)
  - `product_id` (UUID, FK -> `products(id)`, nullable)
  - `category_id` (UUID, FK -> `categories(id)`, nullable)
  - `interaction_type` (VARCHAR(60), validated by CHECK constraint)
  - `search_query` (TEXT, nullable)
  - `duration_seconds` (INT, dwell time telemetry)
  - `metadata` (JSONB, client metadata e.g. device, referrer, ranking algorithm version)
  - `created_at` (TIMESTAMPTZ, partitioned / indexed for time-series extraction)
- **Specialized Indexes**:
  - `(user_id, interaction_type)`: Fast historical user affinity lookup.
  - `(interaction_type, created_at DESC)`: Time-windowed training batch extraction.
  - `GIN (to_tsvector('english', search_query))`: Natural language search query clustering.
  - `GIN (metadata)`: JSON attribute extraction.

---

## 3. How to Apply Schema to Supabase

### Option A: Supabase Web Dashboard (Recommended)
1. Log into your project at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** from the left navigation panel.
3. Open or paste the complete SQL script from:
   [`backend/migrations/001_initial_schema.sql`](file:///c:/Users/AMITH/OneDrive/Documents/AI-MARKETING/AI-Marketing/backend/migrations/001_initial_schema.sql)
4. Click **Run**.
5. All 16 tables, constraints, indexes, triggers, and Row Level Security policies will be instantiated.

### Option B: Local PostgreSQL or Supabase CLI
```bash
# Using psql directly
psql -h db.<YOUR-PROJECT-REF>.supabase.co -U postgres -d postgres -f backend/migrations/001_initial_schema.sql

# Or using Supabase CLI
supabase db push
```

### Option C: Connect FastAPI
In `backend/.env`, set your Supabase connection string:
```env
DATABASE_URL=postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```
FastAPI will automatically utilize the async connection pool and health check endpoint to report database connectivity.
