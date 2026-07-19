import { createServerClient } from '@/utils/supabase/server';
import FooterClient from './FooterClient';

export default async function Footer() {
  const supabase = createServerClient();
  const { data: settings } = await supabase
    .from('settings')
    .select('site_name')
    .eq('id', 1)
    .single();

  return <FooterClient settings={settings} />;
}
