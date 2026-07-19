'use client';

import { useState } from 'react';
import Navbar from '@/components/navbar';
import FooterClient from '@/components/FooterClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, MessageCircle, Send, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSiteSettings } from '@/lib/use-site-settings';

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('contact_messages').insert(form);
    setLoading(false);
    if (error) {
      toast.error('Failed to send message. Please try again.');
    } else {
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
        <div className="container relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 border-primary/20 bg-primary/5 text-primary">Contact Us</Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Let&apos;s build something <span className="text-primary">great</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Have a project in mind? We&apos;d love to hear about it. Reach out and let&apos;s create together.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-6">
              <div>
                <h2 className="mb-2 text-2xl font-bold">Get in touch</h2>
                <p className="text-muted-foreground">We typically respond within 24 hours.</p>
              </div>
              {[
                { icon: Mail, label: 'Email', value: settings.email, href: `mailto:${settings.email}` },
                { icon: Phone, label: 'Phone', value: settings.phone, href: `tel:${settings.phone}` },
                { icon: MessageCircle, label: 'WhatsApp', value: settings.whatsapp, href: `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}` },
                { icon: MapPin, label: 'Location', value: settings.address, href: '#map' },
              ].map((c, i) => (
                <a key={i} href={c.href} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                    <div className="font-medium">{c.value}</div>
                  </div>
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                {[
                  { Icon: Instagram, href: settings.instagram },
                  { Icon: Twitter, href: settings.twitter },
                  { Icon: Facebook, href: settings.facebook },
                  { Icon: Linkedin, href: settings.linkedin },
                ].map(({ Icon, href }, i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:border-primary hover:text-primary" aria-label="Social link">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <Card className="lg:col-span-2 border-border/60">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+233 ..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Project inquiry" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your project..." />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                    {loading ? 'Sending...' : <>Send Message <Send className="ml-2 h-4 w-4" /></>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="map" className="border-t border-border/40">
        <div className="h-[400px] w-full bg-muted">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=-0.2287%2C5.5470%2C-0.1687%2C5.6070&layer=mapnik"
            className="h-full w-full border-0"
            loading="lazy"
            title="Twist Studio Location"
          />
        </div>
      </section>

      <FooterClient settings={settings} />
    </div>
  );
}
