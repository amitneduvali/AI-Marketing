# CortexPulse AI - Architecture Overview

## 1. System Vision
CortexPulse AI is an enterprise-grade, AI-powered e-commerce marketplace connecting high-demand buyers and verified sellers with intelligent catalog discovery, personalized merchandising, and predictive marketing telemetry.

## 2. Monorepo Structure
```
AI-Marketing / CortexPulseAI
├── frontend/             # Next.js (App Router), TypeScript, Tailwind CSS, Lucide icons, Framer Motion
├── backend/              # Python FastAPI, SQLAlchemy 2.0, Pydantic v2
├── ml/                   # Python, Scikit-learn, Pandas, NumPy, recommendation & analytics pipelines
├── docs/                 # System architecture, API contracts, specifications, roadmap
├── .gitignore            # Clean global ignore rules
└── README.md             # Developer quickstart and project overview
```

## 3. Component Architecture

### Frontend
- **Framework**: Next.js (React 19, TypeScript)
- **Styling**: Tailwind CSS, CSS variables design system
- **Interactions & UI**: Framer Motion, Lucide icons, shadcn-compatible modular primitives
- **Network Layer**: Type-safe REST client communicating with FastAPI (`/api/v1`)

### Backend
- **Framework**: FastAPI (Async ASGI, Python 3.12+)
- **Validation & Serialization**: Pydantic v2
- **ORM & Data Layer**: SQLAlchemy 2.0 async session management
- **Database**: PostgreSQL (Supabase managed instance)
- **Security & Auth (Target)**: JWT bearer tokens with role-based access control (Customer vs. Seller vs. Admin)

### AI / ML Module
- **Engine**: Scikit-Learn, Pandas, NumPy
- **Purpose**:
  - Collaborative and content-based recommendation systems
  - Customer purchase behavior modeling
  - Dynamic pricing and marketing segmentation
  - Catalog search reranking

### Database Schema (Target)
- `users` (id, email, password_hash, role [customer, seller, admin], created_at)
- `profiles` (user_id, full_name, avatar_url, preferences)
- `stores` (id, seller_id, store_name, slug, description, rating)
- `products` (id, store_id, title, description, price, inventory_count, category, metadata)
- `orders` (id, customer_id, total_amount, status, shipping_address, created_at)
- `order_items` (id, order_id, product_id, store_id, unit_price, quantity)
- `behavior_events` (id, user_id, event_type [view, add_to_cart, search, purchase], payload, timestamp)
