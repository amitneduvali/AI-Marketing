-- =============================================================================
-- CortexPulse AI - Supabase Storage Configuration & Initial Categories Seed
-- Version: 1.0.0
-- =============================================================================

-- 1. Create public bucket for product images in Supabase Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880;

-- 2. Storage Policies for product-images bucket
-- Allow public read access to product images
CREATE POLICY "Public Access to Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated sellers and admins to upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow sellers to delete their uploaded images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- 3. Seed Initial Categories if not present
INSERT INTO public.categories (id, name, slug, description, display_order, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Audio & Acoustics', 'audio-acoustics', 'High-fidelity audio, noise-canceling headphones, and studio gear.', 1, true),
    ('c2222222-2222-2222-2222-222222222222', 'Computer Hardware', 'computer-hardware', 'Workstation components, high-performance inputs, and displays.', 2, true),
    ('c3333333-3333-3333-3333-333333333333', 'Smart Wearables', 'smart-wearables', 'Next-generation bio-metric wearables and spatial computing optics.', 3, true),
    ('c4444444-4444-4444-4444-444444444444', 'Ergonomics & Workstations', 'ergonomics-workstations', 'Adaptive desks, ergonomic mechanical keyboards, and studio seating.', 4, true),
    ('c5555555-5555-5555-5555-555555555555', 'AI Edge Devices', 'ai-edge-devices', 'Edge inference hardware, neural co-processors, and smart sensors.', 5, true)
ON CONFLICT (slug) DO NOTHING;
