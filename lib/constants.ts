export const SITE = {
  name: 'Twist Studio',
  tagline: 'Africa\'s Creative Powerhouse',
  email: 'hello@twiststudio.africa',
  phone: '+233 24 000 0000',
  whatsapp: '+233 24 000 0000',
  address: 'Accra, Ghana',
  social: {
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
    facebook: 'https://facebook.com',
    linkedin: 'https://linkedin.com',
    behance: 'https://behance.net',
  },
};

export const SERVICES_CATEGORIES = [
  'Branding',
  'Web Design',
  'Graphics',
  'Social Media',
  'Video',
  'Print',
];

export const PORTFOLIO_CATEGORIES = [
  'Graphic Design',
  'Branding',
  'Logo Design',
  'Website Design',
  'Video Editing',
  'Motion Graphics',
  'Print Design',
];

export const CREATIVE_SKILLS = [
  'Graphic Design',
  'Website Design',
  'UI/UX',
  'Motion Graphics',
  'Video Editing',
  'Photography',
  'Branding',
  'Copywriting',
  'Social Media Management',
];

export const CLIENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200' },
  received: { label: 'Received', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200' },
  working: { label: 'Working', color: 'text-violet-700', bg: 'bg-violet-100 border-violet-200' },
  waiting: { label: 'Waiting for Client', color: 'text-cyan-700', bg: 'bg-cyan-100 border-cyan-200' },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200' },
  abandoned: { label: 'Abandoned', color: 'text-stone-700', bg: 'bg-stone-200 border-stone-300' },
  rejected: { label: 'Rejected', color: 'text-rose-700', bg: 'bg-rose-100 border-rose-200' },
};

export const JOB_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; }> = {
  assigned: { label: 'Assigned', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200' },
  in_progress: { label: 'In Progress', color: 'text-violet-700', bg: 'bg-violet-100 border-violet-200' },
  revision: { label: 'Revision', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200' },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'text-rose-700', bg: 'bg-rose-100 border-rose-200' },
};

export const APP_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200' },
  approved: { label: 'Approved', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200' },
  rejected: { label: 'Rejected', color: 'text-rose-700', bg: 'bg-rose-100 border-rose-200' },
  suspended: { label: 'Suspended', color: 'text-stone-700', bg: 'bg-stone-200 border-stone-300' },
};

export const COMMISSION_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200' },
  approved: { label: 'Approved', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200' },
  paid: { label: 'Paid', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200' },
};

export const SERVICES_ICONS = [
  { key: 'Branding', label: 'Branding', desc: 'Logos, identity, brand strategy' },
  { key: 'Web Design', label: 'Website Design', desc: 'Modern, responsive websites' },
  { key: 'Graphics', label: 'Graphic Design', desc: 'Visuals for all channels' },
  { key: 'Social Media', label: 'Social Media Design', desc: 'Engaging social content' },
  { key: 'Video', label: 'Video & Motion', desc: 'Editing and motion graphics' },
  { key: 'Print', label: 'Print Design', desc: 'Business cards, flyers, banners' },
];
