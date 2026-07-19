'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar';
import FooterClient from '@/components/FooterClient';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Palette, Globe, Sparkles, Film, Printer, Share2 } from 'lucide-react';
import Link from 'next/link';
import { supabase, Service } from '@/lib/supabase';
import { formatCurrency } from '@/lib/data';
import { useSiteSettings } from '@/lib/use-site-settings';

const ICON_MAP: Record<string, any> = {
  Branding: Palette, 'Web Design': Globe, Graphics: Sparkles,
  'Social Media': Share2, Video: Film, Print: Printer,
};

export default function ServicesPage() {
  const { settings } = useSiteSettings();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('services').select('*').eq('is_active', true).order('sort_order');
      setServices(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute left-1/3 top-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />
        <div className="container relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 border-primary/20 bg-primary/5 text-primary">Our Services</Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Creative services that <span className="text-primary">deliver</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              From branding to web design, we offer a full range of creative services with transparent pricing.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-muted/50" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, i) => {
                const Icon = ICON_MAP[service.category || ''] || Sparkles;
                return (
                  <Card key={service.id} className="group flex flex-col border-border/60 transition-all hover:border-primary/40 hover:shadow-lg">
                    <CardHeader>
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-primary">{service.price_label || formatCurrency(service.price_from)}</div>
                        {service.price_to && !service.price_label && (
                          <div className="text-sm text-muted-foreground">up to {formatCurrency(service.price_to)}</div>
                        )}
                      </div>
                      {service.features && service.features.length > 0 && (
                        <ul className="mb-6 space-y-2 text-sm">
                          {service.features.map((f, j) => (
                            <li key={j} className="flex items-center gap-2 text-muted-foreground">
                              <Check className="h-4 w-4 shrink-0 text-primary" /> {f}
                            </li>
                          ))}
                        </ul>
                      )}
                      <Button asChild className="mt-auto w-full bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                        <Link href="/contact">Request a Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border/40 bg-card/30 py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Need a custom solution?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">We tailor our services to fit your specific needs and budget.</p>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/contact">Get in Touch <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <FooterClient settings={settings} />
    </div>
  );
}
