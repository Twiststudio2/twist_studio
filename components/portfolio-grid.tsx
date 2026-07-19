'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortfolioItem } from '@/lib/supabase';
import { PORTFOLIO_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';

const GRADIENTS = [
  'from-teal-600 to-emerald-800',
  'from-amber-500 to-orange-700',
  'from-blue-600 to-indigo-800',
  'from-rose-500 to-pink-700',
  'from-violet-600 to-purple-800',
  'from-cyan-600 to-teal-800',
  'from-emerald-500 to-green-700',
  'from-fuchsia-500 to-pink-700',
];

type Props = {
  items: PortfolioItem[];
};

export default function PortfolioGrid({ items }: Props) {
  const [active, setActive] = useState('All');

  const filtered = useMemo(() => {
    if (active === 'All') return items;
    return items.filter((item) => item.category === active);
  }, [active, items]);

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {['All', ...PORTFOLIO_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                active === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <div key={item.id} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <ImageIcon className="h-16 w-16 text-white" />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                <Badge className="mb-2 w-fit border-white/20 bg-white/10 text-white backdrop-blur-sm">{item.category}</Badge>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                {item.description && <p className="mt-1 text-sm text-white/80 line-clamp-2">{item.description}</p>}
              </div>
              <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No projects in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
