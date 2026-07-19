
/*
# Twist Studio Core Schema

## Overview
Full multi-user platform for Twist Studio creative agency with role-based access (admin, partner, creative).

## Tables Created

### profiles
- Extends auth.users with role, status, and metadata
- role: 'admin' | 'partner' | 'creative'
- status: 'active' | 'suspended' | 'deactivated'

### partner_applications
- Partner signup applications awaiting admin approval
- status: 'pending' | 'approved' | 'rejected'

### creative_applications
- Creative signup applications awaiting admin approval

### clients
- Clients submitted by partners
- status: 'pending' | 'received' | 'working' | 'waiting' | 'completed' | 'abandoned' | 'rejected'

### services
- Agency services with pricing (editable by admin)

### portfolio_items
- Portfolio of completed projects with categories

### commissions
- Commission records for partners per completed client

### creative_jobs
- Jobs assigned to creatives by admin

### marketing_materials
- Downloadable files for partners (business card, flyers, etc.)

### notifications
- System notifications for users

### testimonials
- Client testimonials displayed on public website

### team_members
- Team members displayed on public website

### statistics
- Dynamic stats displayed on homepage

### contact_messages
- Messages submitted via the public contact form
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'partner' CHECK (role IN ('admin', 'partner', 'creative')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated')),
  avatar_url text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- PARTNER APPLICATIONS
CREATE TABLE IF NOT EXISTS partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date,
  gender text,
  nationality text,
  region text,
  town_city text,
  phone text,
  occupation text,
  emergency_contact text,
  why_join text,
  how_help text,
  profile_picture_url text,
  confirmed_communicator boolean DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pa_select" ON partner_applications;
CREATE POLICY "pa_select" ON partner_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "pa_insert" ON partner_applications;
CREATE POLICY "pa_insert" ON partner_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pa_update" ON partner_applications;
CREATE POLICY "pa_update" ON partner_applications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "pa_delete" ON partner_applications;
CREATE POLICY "pa_delete" ON partner_applications FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- CREATIVE APPLICATIONS
CREATE TABLE IF NOT EXISTS creative_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  date_of_birth date,
  phone text,
  whatsapp text,
  country text,
  region text,
  city text,
  skills text[] DEFAULT '{}',
  years_experience integer DEFAULT 0,
  portfolio_link text,
  sample_works_urls text[] DEFAULT '{}',
  why_hire text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE creative_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ca_select" ON creative_applications;
CREATE POLICY "ca_select" ON creative_applications FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "ca_insert" ON creative_applications;
CREATE POLICY "ca_insert" ON creative_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ca_update" ON creative_applications;
CREATE POLICY "ca_update" ON creative_applications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "ca_delete" ON creative_applications;
CREATE POLICY "ca_delete" ON creative_applications FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  business_name text,
  phone text,
  whatsapp text,
  location text,
  services_needed text,
  estimated_budget numeric(12,2),
  additional_notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'working', 'waiting', 'completed', 'abandoned', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients_select" ON clients;
CREATE POLICY "clients_select" ON clients FOR SELECT TO authenticated
  USING (auth.uid() = partner_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "clients_insert" ON clients;
CREATE POLICY "clients_insert" ON clients FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = partner_id);

DROP POLICY IF EXISTS "clients_update" ON clients;
CREATE POLICY "clients_update" ON clients FOR UPDATE TO authenticated
  USING (auth.uid() = partner_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (auth.uid() = partner_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "clients_delete" ON clients;
CREATE POLICY "clients_delete" ON clients FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- SERVICES
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  price_from numeric(12,2),
  price_to numeric(12,2),
  price_label text,
  features text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_all" ON services;
CREATE POLICY "services_select_all" ON services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "services_insert" ON services;
CREATE POLICY "services_insert" ON services FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "services_update" ON services;
CREATE POLICY "services_update" ON services FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "services_delete" ON services;
CREATE POLICY "services_delete" ON services FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- PORTFOLIO ITEMS
CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  image_url text,
  video_url text,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portfolio_select_all" ON portfolio_items;
CREATE POLICY "portfolio_select_all" ON portfolio_items FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "portfolio_insert" ON portfolio_items;
CREATE POLICY "portfolio_insert" ON portfolio_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "portfolio_update" ON portfolio_items;
CREATE POLICY "portfolio_update" ON portfolio_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "portfolio_delete" ON portfolio_items;
CREATE POLICY "portfolio_delete" ON portfolio_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- COMMISSIONS
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  percentage numeric(5,2) DEFAULT 10,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  notes text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comm_select" ON commissions;
CREATE POLICY "comm_select" ON commissions FOR SELECT TO authenticated
  USING (auth.uid() = partner_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "comm_insert" ON commissions;
CREATE POLICY "comm_insert" ON commissions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "comm_update" ON commissions;
CREATE POLICY "comm_update" ON commissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "comm_delete" ON commissions;
CREATE POLICY "comm_delete" ON commissions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- COMMISSION SETTINGS
CREATE TABLE IF NOT EXISTS commission_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  percentage numeric(5,2) NOT NULL DEFAULT 10,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE commission_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cs_select" ON commission_settings;
CREATE POLICY "cs_select" ON commission_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cs_insert" ON commission_settings;
CREATE POLICY "cs_insert" ON commission_settings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "cs_update" ON commission_settings;
CREATE POLICY "cs_update" ON commission_settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- CREATIVE JOBS
CREATE TABLE IF NOT EXISTS creative_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  deadline date,
  payment_amount numeric(12,2),
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'revision', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  brief_url text,
  final_work_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE creative_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cj_select" ON creative_jobs;
CREATE POLICY "cj_select" ON creative_jobs FOR SELECT TO authenticated
  USING (auth.uid() = creative_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "cj_insert" ON creative_jobs;
CREATE POLICY "cj_insert" ON creative_jobs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "cj_update" ON creative_jobs;
CREATE POLICY "cj_update" ON creative_jobs FOR UPDATE TO authenticated
  USING (auth.uid() = creative_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (auth.uid() = creative_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "cj_delete" ON creative_jobs;
CREATE POLICY "cj_delete" ON creative_jobs FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- MARKETING MATERIALS
CREATE TABLE IF NOT EXISTS marketing_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  file_url text NOT NULL,
  file_format text,
  file_size text,
  description text,
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mm_select" ON marketing_materials;
CREATE POLICY "mm_select" ON marketing_materials FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "mm_insert" ON marketing_materials;
CREATE POLICY "mm_insert" ON marketing_materials FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "mm_update" ON marketing_materials;
CREATE POLICY "mm_update" ON marketing_materials FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "mm_delete" ON marketing_materials;
CREATE POLICY "mm_delete" ON marketing_materials FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_select" ON notifications;
CREATE POLICY "notif_select" ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_insert" ON notifications;
CREATE POLICY "notif_insert" ON notifications FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin') OR auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_update" ON notifications;
CREATE POLICY "notif_update" ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_delete" ON notifications;
CREATE POLICY "notif_delete" ON notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- TESTIMONIALS
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_title text,
  content text NOT NULL,
  rating integer DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "test_select" ON testimonials;
CREATE POLICY "test_select" ON testimonials FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "test_insert" ON testimonials;
CREATE POLICY "test_insert" ON testimonials FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "test_update" ON testimonials;
CREATE POLICY "test_update" ON testimonials FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "test_delete" ON testimonials;
CREATE POLICY "test_delete" ON testimonials FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text,
  avatar_url text,
  social_links jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "team_select" ON team_members;
CREATE POLICY "team_select" ON team_members FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "team_insert" ON team_members;
CREATE POLICY "team_insert" ON team_members FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "team_update" ON team_members;
CREATE POLICY "team_update" ON team_members FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "team_delete" ON team_members;
CREATE POLICY "team_delete" ON team_members FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cm_select" ON contact_messages;
CREATE POLICY "cm_select" ON contact_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "cm_insert" ON contact_messages;
CREATE POLICY "cm_insert" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cm_update" ON contact_messages;
CREATE POLICY "cm_update" ON contact_messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ss_select" ON site_settings;
CREATE POLICY "ss_select" ON site_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "ss_insert" ON site_settings;
CREATE POLICY "ss_insert" ON site_settings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "ss_update" ON site_settings;
CREATE POLICY "ss_update" ON site_settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_clients_partner ON clients(partner_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_creative_jobs_creative ON creative_jobs(creative_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_partner_apps_user ON partner_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_creative_apps_user ON creative_applications(user_id);

-- SEED DEFAULT DATA
INSERT INTO services (name, description, category, price_from, price_to, price_label, features, sort_order) VALUES
('Logo Design', 'Professional logo design that captures your brand identity', 'Branding', 150, 500, 'Starting from GHS 150', ARRAY['3 concepts', 'Unlimited revisions', 'All file formats', 'Brand guidelines'], 1),
('Brand Identity', 'Complete branding package for your business', 'Branding', 500, 2000, 'Starting from GHS 500', ARRAY['Logo design', 'Color palette', 'Typography', 'Brand guidelines', 'Business card'], 2),
('Website Design', 'Modern, responsive websites that convert visitors', 'Web Design', 800, 5000, 'Starting from GHS 800', ARRAY['Responsive design', 'SEO optimized', 'CMS integration', '3 months support'], 3),
('Graphic Design', 'Eye-catching graphics for all your marketing needs', 'Graphics', 50, 300, 'Starting from GHS 50', ARRAY['Social media posts', 'Banners', 'Flyers', 'Posters'], 4),
('Social Media Design', 'Consistent social media visual identity', 'Social Media', 200, 800, 'Starting from GHS 200', ARRAY['Profile design', 'Post templates', 'Story templates', 'Monthly packages'], 5),
('Video Editing', 'Professional video editing for any purpose', 'Video', 100, 1000, 'Starting from GHS 100', ARRAY['Color grading', 'Motion graphics', 'Sound design', 'Multiple formats'], 6),
('Motion Graphics', 'Animated graphics and visual effects', 'Video', 200, 1500, 'Starting from GHS 200', ARRAY['Logo animation', 'Explainer videos', 'Social media animations'], 7),
('Print Design', 'High-quality designs for physical print materials', 'Print', 80, 500, 'Starting from GHS 80', ARRAY['Business cards', 'Brochures', 'Banners', 'T-shirts', 'Packaging'], 8)
ON CONFLICT DO NOTHING;

INSERT INTO testimonials (client_name, client_title, content, rating, sort_order) VALUES
('Kwame Mensah', 'CEO, AfriTech Solutions', 'Twist Studio completely transformed our brand identity. Their creativity and professionalism are unmatched in Ghana.', 5, 1),
('Akosua Boateng', 'Marketing Director, GoldCoast Fashion', 'Outstanding work on our social media campaign. We saw a 300% increase in engagement after working with Twist Studio.', 5, 2),
('Emmanuel Asare', 'Founder, Savannah Eats', 'From logo to full website, Twist Studio delivered beyond expectations. Highly recommend!', 5, 3),
('Abena Osei', 'Brand Manager, Nova Cosmetics', 'The team at Twist Studio is incredibly talented. They understood our vision perfectly.', 5, 4)
ON CONFLICT DO NOTHING;

INSERT INTO team_members (name, role, bio, sort_order) VALUES
('Creative Director', 'Head of Design', 'Leading creative vision and design excellence at Twist Studio', 1),
('Lead Developer', 'Web Development', 'Building digital experiences that drive results', 2),
('Brand Strategist', 'Branding & Identity', 'Crafting brand stories that resonate with audiences', 3),
('Motion Artist', 'Video & Animation', 'Bringing brands to life through motion and animation', 4)
ON CONFLICT DO NOTHING;

INSERT INTO commission_settings (percentage) VALUES (10) ON CONFLICT DO NOTHING;
