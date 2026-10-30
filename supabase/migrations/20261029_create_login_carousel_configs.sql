-- ============================================================================
-- Supabase Migration: Create login_carousel_configs Table with RLS Policies
-- ============================================================================

-- Enable pgcrypto / uuid-ossp extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create table login_carousel_configs
CREATE TABLE IF NOT EXISTS public.login_carousel_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('SINGLE_APP', 'SELECTIVE_APPS', 'ALL_APPS')),
  app_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  transition_style TEXT NOT NULL CHECK (transition_style IN (
    'slide', 'vertical', 'fade', 'slide_fade', 'zoom_slide',
    'flip', 'stack', 'spin', 'wipe', 'parallax'
  )),
  transition_duration INT NOT NULL DEFAULT 600,
  autoplay_enabled BOOLEAN NOT NULL DEFAULT true,
  autoplay_interval INT NOT NULL DEFAULT 4500,
  transition_direction TEXT NOT NULL DEFAULT 'left',
  infinite_loop BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance indexes for efficient application queries
CREATE INDEX IF NOT EXISTS idx_login_carousel_configs_scope 
  ON public.login_carousel_configs(scope_type, is_active);

CREATE INDEX IF NOT EXISTS idx_login_carousel_configs_created 
  ON public.login_carousel_configs(created_at DESC);

-- GIN index for fast containment queries on target app_ids
CREATE INDEX IF NOT EXISTS idx_login_carousel_configs_app_ids 
  ON public.login_carousel_configs USING GIN (app_ids);

-- 3. Trigger to maintain updated_at on record modifications
CREATE OR REPLACE FUNCTION public.handle_login_carousel_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_login_carousel_configs_updated_at ON public.login_carousel_configs;
CREATE TRIGGER trigger_set_login_carousel_configs_updated_at
  BEFORE UPDATE ON public.login_carousel_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_login_carousel_configs_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.login_carousel_configs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Read Policy: Public / Authenticated aspirants can read active carousel configurations
-- so client applications and mobile app instances render seamless login animations.
DROP POLICY IF EXISTS "Allow public read active login carousel configs" ON public.login_carousel_configs;
CREATE POLICY "Allow public read active login carousel configs"
  ON public.login_carousel_configs
  FOR SELECT
  USING (is_active = true);

-- Admin Read Policy: Authorized admins can read all configurations (including drafts & inactive ones)
DROP POLICY IF EXISTS "Allow admins read all login carousel configs" ON public.login_carousel_configs;
CREATE POLICY "Allow admins read all login carousel configs"
  ON public.login_carousel_configs
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'sobhadhanaraju0@gmail.com'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'role') = 'service_role'
  );

-- Admin Insert Policy: Only authorized administrators can create new carousel transition configurations
DROP POLICY IF EXISTS "Allow admins insert login carousel configs" ON public.login_carousel_configs;
CREATE POLICY "Allow admins insert login carousel configs"
  ON public.login_carousel_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'sobhadhanaraju0@gmail.com'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'role') = 'service_role'
  );

-- Admin Update Policy: Only authorized administrators can update configurations
DROP POLICY IF EXISTS "Allow admins update login carousel configs" ON public.login_carousel_configs;
CREATE POLICY "Allow admins update login carousel configs"
  ON public.login_carousel_configs
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'sobhadhanaraju0@gmail.com'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'role') = 'service_role'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'sobhadhanaraju0@gmail.com'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'role') = 'service_role'
  );

-- Admin Delete Policy: Only authorized administrators can delete configurations
DROP POLICY IF EXISTS "Allow admins delete login carousel configs" ON public.login_carousel_configs;
CREATE POLICY "Allow admins delete login carousel configs"
  ON public.login_carousel_configs
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'sobhadhanaraju0@gmail.com'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'role') = 'service_role'
  );

-- Service role bypass policy for backend services
DROP POLICY IF EXISTS "Allow service role full access on login carousel configs" ON public.login_carousel_configs;
CREATE POLICY "Allow service role full access on login carousel configs"
  ON public.login_carousel_configs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Initial Seed: Global Default Configuration for All Apps
INSERT INTO public.login_carousel_configs (
  id,
  scope_type,
  app_ids,
  transition_style,
  transition_duration,
  autoplay_enabled,
  autoplay_interval,
  transition_direction,
  infinite_loop,
  is_active
) VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'ALL_APPS',
  '["all"]'::jsonb,
  'fade',
  700,
  true,
  4500,
  'left',
  true,
  true
)
ON CONFLICT (id) DO NOTHING;
