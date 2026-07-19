'use client';

import Navbar from '@/components/navbar';
import FooterClient from '@/components/FooterClient';
import { Badge } from '@/components/ui/badge';
import { Target, Eye, Heart, Sparkles, Shield, Zap, Users, Lightbulb } from 'lucide-react';
import { useSiteSettings } from '@/lib/use-site-settings';

const VALUES = [
  { icon: Lightbulb, title: 'Creativity', desc: 'We push boundaries and explore new possibilities in every project.' },
  { icon: Shield, title: 'Professionalism', desc: 'We hold ourselves to the highest standards in everything we do.' },
  { icon: Heart, title: 'Integrity', desc: 'We build trust through transparency and honest communication.' },
  { icon: Zap, title: 'Innovation', desc: 'We embrace new tools, techniques, and ideas to stay ahead.' },
  { icon: Users, title: 'Teamwork', desc: 'We collaborate internally and with clients to achieve the best results.' },
];

export default function AboutPage() {
  const { settings } = useSiteSettings();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
        <div className="container relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 border-primary/20 bg-primary/5 text-primary">About Us</Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              We are <span className="text-primary">{settings.agency_name}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {settings.tagline}. A creative agency on a mission to put African talent on the global map through world-class design and innovation.
            </p>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="outline" className="mb-3 border-primary/30 text-primary">Our Story</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it all began</h2>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>Twist Studio was founded with a simple yet powerful vision: to create a space where African creativity could flourish and compete on the world stage.</p>
                <p>What started as a small team of passionate designers has grown into a full-service creative agency serving clients across the continent and beyond. We saw a gap — businesses needed professional creative services, and talented creatives needed opportunities to showcase their skills.</p>
                <p>Today, Twist Studio bridges that gap. We partner with talented creatives and marketers, empowering them to deliver exceptional work while building sustainable careers. Every project we take on is a step toward our vision of an Africa that leads in creative excellence.</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/10 to-accent/10 blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground">
                    <Sparkles className="mb-2 h-8 w-8" />
                    <div className="text-3xl font-bold">2021</div>
                    <div className="text-sm opacity-90">Founded</div>
                  </div>
                  <div className="aspect-video rounded-2xl border border-border bg-card p-6">
                    <div className="text-3xl font-bold text-foreground">250+</div>
                    <div className="text-sm text-muted-foreground">Projects completed</div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-video rounded-2xl border border-border bg-card p-6">
                    <div className="text-3xl font-bold text-foreground">25+</div>
                    <div className="text-sm text-muted-foreground">Team members</div>
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

      {/* MISSION & VISION */}
      <section className="border-y border-border/40 bg-card/30 py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background p-8 md:p-10">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Our Mission</h3>
              <p className="text-lg text-muted-foreground">
                {settings.mission}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background p-8 md:p-10">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">Our Vision</h3>
              <p className="text-lg text-muted-foreground">
                {settings.vision}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary">Core Values</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">What we stand for</h2>
            <p className="mt-4 text-lg text-muted-foreground">The principles that guide every decision we make.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {VALUES.map((v, i) => (
              <div key={i} className="group rounded-2xl border border-border/60 bg-card p-6 text-center transition-all hover:border-primary/40 hover:shadow-md">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">{v.title}</h3>
                <p className="text-xs text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterClient settings={settings} />
    </div>
  );
}
