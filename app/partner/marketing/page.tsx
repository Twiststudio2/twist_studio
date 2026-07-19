'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Image as ImageIcon, Package, Loader as Loader2, ExternalLink } from 'lucide-react';
import { supabase, MarketingMaterial } from '@/lib/supabase';

const BUSINESS_CARD_IMAGE = '/assets/marketing-materials/twist_sudio_B-card_[Recovered]-01.jpg';

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  'Business Card': FileText,
  'T-shirt': Package,
  Flyer: FileText,
  Logo: ImageIcon,
  'Brand Guidelines': FileText,
};

export default function PartnerMarketingPage() {
  const [materials, setMaterials] = useState<MarketingMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('marketing_materials')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      setMaterials((data as MarketingMaterial[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Download className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Marketing Materials</h2>
          <p className="text-sm text-muted-foreground">
            Download branded assets to help you promote Twist Studio and attract new clients.
          </p>
        </div>
      </div>

      {materials.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Package className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No materials available</p>
              <p className="text-sm text-muted-foreground">
                Marketing assets will appear here once they are uploaded.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((m) => {
            const CatIcon = CATEGORY_ICONS[m.category] || FileText;
            const isBusinessCard = m.category === 'Business Card';
            return (
              <Card
                key={m.id}
                className="group flex flex-col overflow-hidden border-border/60 transition-shadow hover:shadow-md"
              >
                {/* Preview area */}
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-muted">
                  {isBusinessCard ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={BUSINESS_CARD_IMAGE}
                      alt={m.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <CatIcon className="h-8 w-8" />
                    </div>
                  )}
                  <Badge className="absolute left-3 top-3 border-transparent bg-primary/90 text-primary-foreground">
                    {m.category}
                  </Badge>
                </div>

                {/* Body */}
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight">{m.name}</h3>
                    {m.file_format && (
                      <Badge variant="outline" className="shrink-0 uppercase">
                        {m.file_format}
                      </Badge>
                    )}
                  </div>
                  {m.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
                  )}

                  <div className="mt-auto pt-4">
                    <Button asChild className="w-full">
                      <a href={m.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download
                        <ExternalLink className="ml-1.5 h-3 w-3 opacity-70" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
