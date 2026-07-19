/*
# Add media-assets storage bucket for portfolio, marketing, and creative work uploads

## Overview
The portfolio, marketing materials, and creative job submission pages currently
require users to paste external URLs for images, videos, and files. This migration
creates a public storage bucket so users can upload files directly from their
computer instead of pasting links.

## Changes

### 1. Storage
- Create public bucket `media-assets` for portfolio images/videos, marketing
  files, creative job deliverables, and creative application sample works.

### 2. RLS policies on storage.objects
- SELECT: public read (anon + authenticated) — portfolio images must render for
  anonymous site visitors, and marketing/creative assets are served to signed-in
  partners/creatives.
- INSERT/UPDATE/DELETE: any authenticated user (admin, creative, partner, hr)
  can upload, replace, or remove their own work files. The application DB layer
  (RLS on portfolio_items, marketing_materials, creative_jobs) already gates
  who can create rows referencing these files.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('media-assets', 'media-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "media_assets_select" ON storage.objects;
CREATE POLICY "media_assets_select" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media-assets');

DROP POLICY IF EXISTS "media_assets_insert" ON storage.objects;
CREATE POLICY "media_assets_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media-assets');

DROP POLICY IF EXISTS "media_assets_update" ON storage.objects;
CREATE POLICY "media_assets_update" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media-assets')
  WITH CHECK (bucket_id = 'media-assets');

DROP POLICY IF EXISTS "media_assets_delete" ON storage.objects;
CREATE POLICY "media_assets_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media-assets');
