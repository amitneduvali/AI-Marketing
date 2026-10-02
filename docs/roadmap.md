# CortexPulse AI - Engineering Roadmap

## Phase 1: Foundation (Current)
- [x] Monorepo folder scaffolding (`frontend/`, `backend/`, `ml/`, `docs/`)
- [x] Backend FastAPI application with modular configuration, router, and health endpoint
- [x] Frontend Next.js TypeScript application with modern design system and local connectivity indicator
- [x] AI/ML module structure ready for pipelines and feature engineering
- [x] Developer run guides and environment variable templates

## Phase 2: Data Models & Supabase Integration
- [ ] Supabase PostgreSQL database connection & Alembic migration setup
- [ ] SQLAlchemy models (`User`, `Profile`, `Store`, `Product`, `Order`, `OrderItem`, `BehaviorEvent`)
- [ ] Seed script for testing initial schemas

## Phase 3: Authentication & Role-Based Access Control
- [ ] Customer & Seller authentication endpoints with secure JWTs
- [ ] Role validation middleware & frontend auth context
- [ ] Onboarding views for buyers and sellers

## Phase 4: Core Marketplace & E-Commerce Workflows
- [ ] Seller catalog and inventory management interface
- [ ] Customer product browsing, filtering, search, and detail views
- [ ] Cart state management and checkout workflow
- [ ] Customer order history & seller sales analytics

## Phase 5: AI Recommendations & Behavioral Intelligence
- [ ] Event telemetry collection (view, click, add-to-cart, purchase)
- [ ] ML feature store and training pipeline
- [ ] Recommendation inference service integrated into product feeds
