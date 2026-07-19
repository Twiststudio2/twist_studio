'use client';

import Link from 'next/link';
import { Instagram, Twitter, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '@/components/logo';
import { SiteSettings } from '@/lib/use-site-settings';

type Props = {
  settings: {
    logo_url?: string | null;
    site_name?: string | null;
    agency_name?: string | null;
    tagline?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
  } | null;
};

export default function FooterClient({ settings }: Props) {
  const footerSettings = {
    agency_name: settings?.site_name || settings?.agency_name || 'Twist Studio',
    tagline: settings?.tagline || 'Crafting bold brands and remarkable digital experiences.',
    email: settings?.email || 'hello@twiststudio.com',
    phone: settings?.phone || '+233 000 000 000',
    address: settings?.address || 'Accra, Ghana',
    instagram: settings?.instagram || '#',
    twitter: settings?.twitter || '#',
    facebook: settings?.facebook || '#',
    linkedin: settings?.linkedin || '#',
  };
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Logo logoUrl={settings?.logo_url || '/logo.jpg'} agencyName={footerSettings.agency_name} />
            <p className="max-w-xs text-sm text-muted-foreground">
              {footerSettings.tagline}.
            </p>
            <div className="flex gap-3">
              <a href={footerSettings.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
              <a href={footerSettings.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
              <a href={footerSettings.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
              <a href={footerSettings.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Services</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/services" className="hover:text-primary">Branding & Identity</Link></li>
              <li><Link href="/services" className="hover:text-primary">Website Design</Link></li>
              <li><Link href="/services" className="hover:text-primary">Graphic Design</Link></li>
              <li><Link href="/services" className="hover:text-primary">Video Editing</Link></li>
              <li><Link href="/services" className="hover:text-primary">Motion Graphics</Link></li>
              <li><Link href="/services" className="hover:text-primary">Print Design</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/portfolio" className="hover:text-primary">Portfolio</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link href="/login" className="hover:text-primary">Partner Login</Link></li>
              <li><Link href="/signup" className="hover:text-primary">Join as Partner</Link></li>
              <li><Link href="/signup" className="hover:text-primary">Join as Creative</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{footerSettings.email}</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{footerSettings.phone}</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{footerSettings.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} {footerSettings.agency_name}. All rights reserved.</p>
          <p>Crafted with care in Accra, Ghana.</p>
        </div>
      </div>
    </footer>
  );
}
