'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Palette, Globe, Sparkles, Video, Film, Printer, ArrowRight, Star, TrendingUp, Users, Award, Briefcase, Quote, CircleCheck as CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/navbar';
import FooterClient from '@/components/FooterClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { SITE, SERVICES_ICONS } from '@/lib/constants';
import { useSiteSettings } from '@/lib/use-site-settings';

const ICON_MAP: Record<string, any> = { Branding: Palette, 'Web Design': Globe, Graphics: Sparkles, 'Social Media': Sparkles, Video: Film, Print: Printer };

export default function Home() {
  const { settings } = useSiteSettings();
  const [stats, setStats] = useState({ projects: 250, clients: 180, team: 25, awards: 12 });
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: t } = await supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order').limit(4);
      setTestimonials(t || []);
      const { data: p } = await supabase.from('portfolio_items').select('*').eq('is_active', true).eq('is_featured', true).order('sort_order').limit(6);
      setPortfolio(p || []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-accent/10 blur-3xl" />
        <div className="container relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:py-36">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
              <Sparkles className="mr-1.5 h-3 w-3" /> {settings.tagline}
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              We craft brands that <span className="text-primary">move</span> people
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
              From branding to web design, video editing to motion graphics — Twist Studio delivers world-class creative solutions for ambitious businesses.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="group bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/contact">Start a Project <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/portfolio">View Our Work</Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: Briefcase, label: 'Projects', value: stats.projects, suffix: '+' },
              { icon: Users, label: 'Happy Clients', value: stats.clients, suffix: '+' },
              { icon: Award, label: 'Awards', value: stats.awards, suffix: '' },
              { icon: TrendingUp, label: 'Team Members', value: stats.team, suffix: '+' },
            ].map((s, i) => (
              <div key={i} className="animate-fade-in-up rounded-xl border border-border/60 bg-card/50 p-5 text-center backdrop-blur-sm" style={{ animationDelay: `${i * 100}ms` }}>
                <s.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                <div className="text-3xl font-bold text-foreground">{s.value}{s.suffix}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="border-t border-border/40 bg-card/30 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary">What We Do</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Our Services</h2>
            <p className="mt-4 text-lg text-muted-foreground">Comprehensive creative services to elevate your brand.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES_ICONS.map((s, i) => {
              const Icon = ICON_MAP[s.key] || Sparkles;
              return (
                <Card key={i} className="group relative overflow-hidden border-border/60 transition-all hover:border-primary/40 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-1.5 text-lg font-semibold">{s.label}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                  <div className="absolute right-0 top-0 h-20 w-20 translate-x-10 -translate-y-10 rounded-full bg-accent/5 transition-transform group-hover:translate-x-0" />
                </Card>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/services">View All Services & Pricing <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="outline" className="mb-3 border-primary/30 text-primary">Why Twist Studio</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Why brands choose us</h2>
              <p className="mt-4 text-lg text-muted-foreground">We combine creativity with strategy to deliver work that drives real business results.</p>
              <div className="mt-8 space-y-5">
                {[
                  { title: 'World-class creativity', desc: 'Our team brings fresh perspectives and bold ideas to every project.' },
                  { title: 'Strategic approach', desc: 'Every design decision is backed by research and strategy.' },
                  { title: 'Timely delivery', desc: 'We respect deadlines and deliver quality work on schedule.' },
                  { title: 'Dedicated support', desc: 'Personalized attention from project kickoff to final delivery.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/10 to-accent/10 blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground">
                    <Award className="mb-2 h-8 w-8" />
                    <div className="text-3xl font-bold">98%</div>
                    <div className="text-sm opacity-90">Client satisfaction</div>
                  </div>
                  <div className="aspect-video rounded-2xl border border-border bg-card p-6">
                    <TrendingUp className="mb-2 h-8 w-8 text-accent" />
                    <div className="text-3xl font-bold">3x</div>
                    <div className="text-sm text-muted-foreground">Avg. engagement boost</div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-video rounded-2xl border border-border bg-card p-6">
                    <Briefcase className="mb-2 h-8 w-8 text-primary" />
                    <div className="text-3xl font-bold">250+</div>
                    <div className="text-sm text-muted-foreground">Projects delivered</div>
                  </div>
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-accent to-accent/70 p-6 text-accent-foreground">
                    <Users className="mb-2 h-8 w-8" />
                    <div className="text-3xl font-bold">180+</div>
                    <div className="text-sm opacity-90">Happy clients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO PREVIEW */}
      <section className="border-t border-border/40 bg-card/30 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-14 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Badge variant="outline" className="mb-3 border-primary/30 text-primary">Our Work</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Featured projects</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/portfolio">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(portfolio.length > 0 ? portfolio : SAMPLE_PORTFOLIO).map((item, i) => (
              <Link key={i} href="/portfolio" className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60">
                <div className={`absolute inset-0 bg-gradient-to-br ${SAMPLE_GRADIENTS[i % SAMPLE_GRADIENTS.length]}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                  <Badge className="mb-2 w-fit border-white/20 bg-white/10 text-white backdrop-blur-sm">{item.category}</Badge>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary">Testimonials</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">What clients say</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(testimonials.length > 0 ? testimonials : SAMPLE_TESTIMONIALS).map((t, i) => (
              <Card key={i} className="border-border/60">
                <CardContent className="p-6">
                  <Quote className="mb-3 h-8 w-8 text-primary/30" />
                  <p className="text-sm leading-relaxed text-foreground/80">&ldquo;{t.content}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {t.client_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.client_name}</div>
                      <div className="text-xs text-muted-foreground">{t.client_title}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-0.5">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="border-t border-border/40 bg-card/30 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary">The Team</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Meet our creatives</h2>
            <p className="mt-4 text-lg text-muted-foreground">Talented professionals behind every project.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_TEAM.map((m, i) => (
              <div key={i} className="group text-center">
                <div className="relative mx-auto mb-4 h-40 w-40 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-primary/40">
                    {m.name.charAt(0)}
                  </div>
                  <div className="absolute inset-0 bg-primary/0 transition-colors group-hover:bg-primary/10" />
                </div>
                <h3 className="font-semibold">{m.name}</h3>
                <p className="text-sm text-primary">{m.role}</p>
                <p className="mt-2 text-xs text-muted-foreground">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / CONTACT */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="container relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl">
            Ready to elevate your brand?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Let&apos;s create something extraordinary together. Get in touch today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/contact">Start a Project <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/signup">Become a Partner</Link>
            </Button>
          </div>
        </div>
      </section>

      <FooterClient settings={settings} />
    </div>
  );
}

const SAMPLE_GRADIENTS = [
  'from-teal-600 to-emerald-800',
  'from-amber-500 to-orange-700',
  'from-blue-600 to-indigo-800',
  'from-rose-500 to-pink-700',
  'from-violet-600 to-purple-800',
  'from-cyan-600 to-teal-800',
];

const SAMPLE_PORTFOLIO = [
  { title: 'AfriTech Brand Identity', category: 'Branding' },
  { title: 'GoldCoast Fashion Website', category: 'Website Design' },
  { title: 'Nova Cosmetics Logo', category: 'Logo Design' },
  { title: 'Savannah Eats Campaign', category: 'Graphic Design' },
  { title: 'Accra Motion Reel', category: 'Motion Graphics' },
  { title: 'Heritage Print Series', category: 'Print Design' },
];

const SAMPLE_TESTIMONIALS = [
  { client_name: 'Kwame Mensah', client_title: 'CEO, AfriTech', content: 'Twist Studio completely transformed our brand identity. Their creativity and professionalism are unmatched.', rating: 5 },
  { client_name: 'Akosua Boateng', client_title: 'Marketing Director', content: 'Outstanding work on our social media campaign. We saw a 300% increase in engagement.', rating: 5 },
  { client_name: 'Emmanuel Asare', client_title: 'Founder, Savannah Eats', content: 'From logo to full website, Twist Studio delivered beyond expectations.', rating: 5 },
  { client_name: 'Abena Osei', client_title: 'Brand Manager', content: 'The team at Twist Studio is incredibly talented. They understood our vision perfectly.', rating: 5 },
];

const SAMPLE_TEAM = [
  { name: 'Creative Director', role: 'Head of Design', bio: 'Leading creative vision and design excellence.' },
  { name: 'Lead Developer', role: 'Web Development', bio: 'Building digital experiences that drive results.' },
  { name: 'Brand Strategist', role: 'Branding & Identity', bio: 'Crafting brand stories that resonate.' },
  { name: 'Motion Artist', role: 'Video & Animation', bio: 'Bringing brands to life through motion.' },
];
