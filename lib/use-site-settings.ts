'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SITE } from '@/lib/constants';

export type SiteSettings = {
  agency_name: string;
  site_name?: string | null;
  tagline: string;
  mission: string;
  vision: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  instagram: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  logo_url: string;
};

const DEFAULTS: SiteSettings = {
  agency_name: SITE.name,
  site_name: SITE.name,
  tagline: SITE.tagline,
  mission: 'Provide world-class creative solutions while creating opportunities for talented creatives and marketers.',
  vision: "Become Africa's leading creative agency, setting the standard for excellence and innovation in design.",
  email: SITE.email,
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  address: SITE.address,
  instagram: SITE.social.instagram,
  twitter: SITE.social.twitter,
  facebook: SITE.social.facebook,
  linkedin: SITE.social.linkedin,
  logo_url: '',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.from('site_settings').select('key, value');
      if (!mounted || !data) { setLoading(false); return; }
      const map: Record<string, string> = {};
      data.forEach((s) => { if (s.value) map[s.key] = s.value; });
      setSettings((prev) => ({ ...prev, ...map }));
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return { settings, loading };
}
