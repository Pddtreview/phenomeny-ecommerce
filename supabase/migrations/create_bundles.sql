-- Nauvarah: bundles + bundle_items (run once; safe to re-run for idempotent policies)
-- If you already had bundle_items.variant_id, run:
--   ALTER TABLE public.bundle_items RENAME COLUMN variant_id TO product_variant_id;

CREATE TABLE IF NOT EXISTS public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric(12, 2) NOT NULL DEFAULT 0,
  compare_price numeric(12, 2),
  is_active boolean NOT NULL DEFAULT true,
  images text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid NOT NULL REFERENCES public.bundles (id) ON DELETE CASCADE,
  product_variant_id uuid NOT NULL REFERENCES public.product_variants (id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bundle_id, product_variant_id)
);

CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON public.bundle_items (bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product_variant_id ON public.bundle_items (product_variant_id);
CREATE INDEX IF NOT EXISTS idx_bundles_slug ON public.bundles (slug);
CREATE INDEX IF NOT EXISTS idx_bundles_is_active ON public.bundles (is_active);

ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bundles_select_public_active" ON public.bundles;
CREATE POLICY "bundles_select_public_active"
  ON public.bundles
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "bundles_all_authenticated" ON public.bundles;
CREATE POLICY "bundles_all_authenticated"
  ON public.bundles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "bundle_items_select_public_active_bundle" ON public.bundle_items;
CREATE POLICY "bundle_items_select_public_active_bundle"
  ON public.bundle_items
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.bundles b
      WHERE b.id = bundle_items.bundle_id
        AND b.is_active = true
    )
  );

DROP POLICY IF EXISTS "bundle_items_all_authenticated" ON public.bundle_items;
CREATE POLICY "bundle_items_all_authenticated"
  ON public.bundle_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
