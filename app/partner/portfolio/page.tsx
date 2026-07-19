'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Filter, Loader as Loader2 } from 'lucide-react';
import { supabase, PortfolioItem } from '@/lib/supabase';
import { PORTFOLIO_CATEGORIES } from '@/lib/constants';

// Stable gradient palette for placeholder backgrounds
const GRADIENTS = [
  'from-primary/80 to-primary/40',
  'from-accent/80 to-accent/40',
  'from-primary/70 to-accent/50',
  'from-teal-600/70 to-cyan-400/50',
  'from-amber-500/70 to-orange-400/50',
  'from-emerald-600/70 to-teal-400/50',
];

function gradientFor(index: number) {
  return GRADIENTS[index % GRADIENTS.length];
}

export default function PartnerPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      setItems((data as PortfolioItem[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => (category === 'all' ? items : items.filter((i) => i.category === category)),
    [items, category]
  );

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
          <ImageIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Agency Portfolio</h2>
          <p className="text-sm text-muted-foreground">
            Browse our creative work to help pitch services to your clients.
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" /> Filter:
        </span>
        <Button
          size="sm"
          variant={category === 'all' ? 'default' : 'outline'}
          onClick={() => setCategory('all')}
        >
          All
        </Button>
        {PORTFOLIO_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={category === cat ? 'default' : 'outline'}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No portfolio items found</p>
              <p className="text-sm text-muted-foreground">
                {category !== 'all'
                  ? 'Try selecting a different category.'
                  : 'Portfolio work will appear here once it is published.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, index) => (
            <Card
              key={item.id}
              className="group flex flex-col overflow-hidden border-border/60 transition-shadow hover:shadow-md"
            >
              {/* Image / gradient placeholder */}
              <div className="relative flex h-52 items-center justify-center overflow-hidden bg-muted">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientFor(index)}`}
                  >
                    <ImageIcon className="h-12 w-12 text-white/80" />
                  </div>
                )}
                <Badge className="absolute left-3 top-3 border-transparent bg-primary/90 text-primary-foreground">
                  {item.category}
                </Badge>
              </div>

              {/* Body */}
              <CardContent className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold leading-tight">{item.title}</h3>
                {item.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
