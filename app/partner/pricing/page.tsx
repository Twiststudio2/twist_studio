'use client';

import { useEffect, useState } from 'react';
import { supabase, Service } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/data';
import { SERVICES_ICONS } from '@/lib/constants';

export default function PartnerPricingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('services').select('*').eq('is_active', true).order('sort_order');
      setServices(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Agency Price List</h2>
        <p className="text-muted-foreground">Current pricing for all Twist Studio services.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="border-border/60">
            <CardHeader>
              <Badge variant="outline" className="w-fit border-primary/30 text-primary">{service.category}</Badge>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-2xl font-bold text-primary">
                {service.price_label || formatCurrency(service.price_from)}
              </div>
              {service.features && service.features.length > 0 && (
                <ul className="space-y-2 text-sm">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 shrink-0 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No services available yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
