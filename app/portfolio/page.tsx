import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortfolioItem } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import PortfolioGrid from '@/components/portfolio-grid';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function PortfolioPage() {
  const { data } = await supabase.from('portfolio_items').select('*').eq('is_active', true).order('sort_order');
  const items = data || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
        <div className="container relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 border-primary/20 bg-primary/5 text-primary">Portfolio</Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Our <span className="text-primary">work</span> speaks for itself
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              A selection of projects that showcase our creativity and craftsmanship.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <PortfolioGrid items={items} />
        </div>
      </section>

      <section className="border-t border-border/40 bg-card/30 py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Want to be our next success story?</h2>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/contact">Start a Project <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
