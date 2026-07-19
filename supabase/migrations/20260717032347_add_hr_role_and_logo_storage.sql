/*
# Add HR Role, HR-Partner Recruitment, HR Commissions, and Logo Storage

## Overview
This migration adds a new "hr" (Human Resources) role to the platform. HR managers
recruit partners and earn commissions when their recruited partners' clients complete
jobs successfully. Multiple HR managers can exist. Also adds logo storage support.

## Changes

### 1. profiles table
- Added 'hr' to the role CHECK constraint
- New column: `recruited_by_hr_id` (uuid, nullable) — references the HR manager who recruited this partner
- New index on recruited_by_hr_id for efficient lookups

### 2. commissions table
- New column: `hr_id` (uuid, nullable) — references the HR manager who earns the commission
- New column: `hr_percentage` (numeric, default 3) — the HR commission percentage
- New column: `hr_amount` (numeric, default 0) — the calculated HR commission amount
- New index on hr_id for efficient lookups

### 3. site_settings
- Insert default keys for logo_url (empty string) so the Logo component can read it

### 4. Storage
- Create public bucket 'site-assets' for logo and branding uploads

### 5. RLS
- profiles SELECT already allows all authenticated users to read
- profiles UPDATE policy already allows admins; extended to allow HR to update
  partner status of partners they recruited (for basic management)
- commissions SELECT extended to allow HR to see commissions where hr_id = auth.uid()
- Storage bucket policies allow authenticated users to read, and admins/HR to upload
*/

-- 1. Update profiles role constraint to include 'hr'
DO $$ BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin', 'partner', 'creative', 'hr'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Add recruited_by_hr_id column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recruited_by_hr_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_recruited_by_hr ON profiles(recruited_by_hr_id);

-- 2. Add HR commission fields to commissions
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS hr_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS hr_percentage numeric(5,2) DEFAULT 3;
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS hr_amount numeric(12,2) DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_commissions_hr ON commissions(hr_id);

-- 3. Update commissions SELECT policy to let HR see their commissions
DROP POLICY IF EXISTS "comm_select" ON commissions;
CREATE POLICY "comm_select" ON commissions FOR SELECT TO authenticated
  USING (
    auth.uid() = partner_id
    OR auth.uid() = hr_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 4. Update profiles SELECT to remain visible to all authenticated (already true)
-- Extend profiles UPDATE to allow HR to manage partners they recruited
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'hr' AND p.id = profiles.recruited_by_hr_id)
  )
  WITH CHECK (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 5. Insert default site_settings keys for logo
INSERT INTO site_settings (key, value) VALUES
  ('logo_url', ''),
  ('hr_commission_percentage', '3')
ON CONFLICT (key) DO NOTHING;

-- 6. Create storage bucket for site assets (logo, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, admin/hr write
DROP POLICY IF EXISTS "site_assets_select" ON storage.objects;
CREATE POLICY "site_assets_select" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "site_assets_insert" ON storage.objects;
CREATE POLICY "site_assets_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'site-assets'
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'hr'))
  );

DROP POLICY IF EXISTS "site_assets_update" ON storage.objects;
CREATE POLICY "site_assets_update" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'site-assets'
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'hr'))
  )
  WITH CHECK (
    bucket_id = 'site-assets'
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'hr'))
  );

DROP POLICY IF EXISTS "site_assets_delete" ON storage.objects;
CREATE POLICY "site_assets_delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'site-assets'
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'hr'))
  );
