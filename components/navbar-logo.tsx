import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

export default async function NavbarLogo() {
  const { data } = await supabase.from('settings').select('logo_url').eq('id', 1).single();
  const logoUrl = data?.logo_url || '/logo.png';

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-10 w-[160px] items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/10">
        <Image
          src={logoUrl}
          width={160}
          height={40}
          alt="Logo"
          priority={true}
          className="rounded-lg object-contain"
          unoptimized
        />
      </div>
    </div>
  );
}
