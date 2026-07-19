import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'partner' | 'creative' | 'hr';
  status: 'active' | 'suspended' | 'deactivated';
  avatar_url: string | null;
  phone: string | null;
  recruited_by_hr_id: string | null;
  created_at: string;
};

export type PartnerApplication = {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  region: string | null;
  town_city: string | null;
  phone: string | null;
  occupation: string | null;
  emergency_contact: string | null;
  why_join: string | null;
  how_help: string | null;
  profile_picture_url: string | null;
  confirmed_communicator: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  admin_notes: string | null;
  created_at: string;
};

export type CreativeApplication = {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string | null;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  skills: string[];
  years_experience: number;
  portfolio_link: string | null;
  sample_works_urls: string[];
  why_hire: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  admin_notes: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  partner_id: string;
  client_name: string;
  business_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  services_needed: string | null;
  estimated_budget: number | null;
  additional_notes: string | null;
  status: 'pending' | 'received' | 'working' | 'waiting' | 'completed' | 'abandoned' | 'rejected';
  admin_notes: string | null;
  created_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_from: number | null;
  price_to: number | null;
  price_label: string | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  video_url: string | null;
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Commission = {
  id: string;
  partner_id: string;
  client_id: string | null;
  amount: number;
  percentage: number;
  status: 'pending' | 'approved' | 'paid';
  notes: string | null;
  paid_at: string | null;
  hr_id: string | null;
  hr_percentage: number;
  hr_amount: number;
  created_at: string;
};

export type CreativeJob = {
  id: string;
  creative_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  deadline: string | null;
  payment_amount: number | null;
  status: 'assigned' | 'in_progress' | 'revision' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid';
  brief_url: string | null;
  final_work_url: string | null;
  notes: string | null;
  created_at: string;
};

export type MarketingMaterial = {
  id: string;
  name: string;
  category: string;
  file_url: string;
  file_format: string | null;
  file_size: string | null;
  description: string | null;
  is_active: boolean;
  version: number;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link: string | null;
  created_at: string;
};

export type Testimonial = {
  id: string;
  client_name: string;
  client_title: string | null;
  content: string;
  rating: number;
  avatar_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  social_links: Record<string, string>;
  is_active: boolean;
  sort_order: number;
};
