import { createServerClient } from '@/utils/supabase/server';
import FooterClient from './FooterClient';

export default async function Footer() {
  const supabase = createServerClient();

  const [{ data: siteSettings }, { data: settingsRow }] = await Promise.all([
    supabase.from('site_settings').select('key, value'),
    supabase.from('settings').select('logo_url').eq('id', 1).single(),
  ]);

  const settings = (siteSettings || []).reduce<Record<string, string | null>>((acc, item) => {
    if (item.key) acc[item.key] = item.value ?? null;
    return acc;
  }, {});

  return (
    <FooterClient
      settings={{
        ...settings,
        logo_url: settings.logo_url || settingsRow?.logo_url || null,
      }}
    />
  );
}
