/*
# Add default theme color settings

## Overview
Adds default theme color keys to site_settings so the admin can customize
the website's primary and accent colors from the dashboard. Values are stored
as hex strings for easy color-picker integration; a runtime component converts
them to HSL and injects CSS variables.

## Changes
- Insert default keys: theme_primary (#0d6650 — dark teal), theme_accent (#f0a500 — gold)
- No schema changes; site_settings table already exists with anon-read RLS
*/

INSERT INTO site_settings (key, value) VALUES
  ('theme_primary', '#0d6650'),
  ('theme_accent', '#f0a500')
ON CONFLICT (key) DO NOTHING;
