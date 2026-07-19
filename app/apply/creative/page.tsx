'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader as Loader2, ArrowRight, CircleCheck as CheckCircle2, Clock, Circle as XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { CREATIVE_SKILLS, APP_STATUS_CONFIG } from '@/lib/constants';
import { FileUpload } from '@/components/file-upload';
import { X } from 'lucide-react';

export default function CreativeApplicationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<any>(null);
  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', phone: '', whatsapp: '', country: '',
    region: '', city: '', skills: [] as string[], years_experience: 0,
    portfolio_link: '', sample_works_urls: [] as string[], why_hire: '',
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/signup');
    if (user) {
      supabase.from('creative_applications').select('*').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => { if (data) setExisting(data); });
    }
  }, [user, authLoading, router]);

  const toggleSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('creative_applications').insert({
      ...form, user_id: user.id,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Application submitted!');
      const { data } = await supabase.from('creative_applications').select('*').eq('user_id', user.id).maybeSingle();
      if (data) setExisting(data);
    }
  };

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (existing) {
    const cfg = APP_STATUS_CONFIG[existing.status];
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="max-w-lg border-border/60">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {existing.status === 'approved' && <CheckCircle2 className="h-8 w-8 text-emerald-600" />}
              {existing.status === 'pending' && <Clock className="h-8 w-8 text-amber-600" />}
              {existing.status === 'rejected' && <XCircle className="h-8 w-8 text-rose-600" />}
              {existing.status === 'suspended' && <XCircle className="h-8 w-8 text-stone-600" />}
            </div>
            <CardTitle className="text-2xl">Application {cfg.label}</CardTitle>
            <CardDescription>
              {existing.status === 'pending' && 'Your application is under review.'}
              {existing.status === 'approved' && 'Congratulations! You can now access your creative dashboard.'}
              {existing.status === 'rejected' && 'Your application was not approved at this time.'}
              {existing.status === 'suspended' && 'Your application has been suspended.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {existing.status === 'approved' ? (
              <Button onClick={() => router.push('/creative')} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => router.push('/')} variant="outline" className="w-full" size="lg">Back to Home</Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Creative Application</h1>
          <p className="mt-2 text-muted-foreground">Showcase your talent and join our creative team.</p>
        </div>

        <Card className="border-border/60">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Ghana" />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Areas of Creativity *</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {CREATIVE_SKILLS.map((skill) => (
                    <label key={skill} className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm cursor-pointer hover:border-primary/40">
                      <Checkbox checked={form.skills.includes(skill)} onCheckedChange={() => toggleSkill(skill)} />
                      {skill}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input type="number" min="0" value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Portfolio Link</Label>
                  <Input value={form.portfolio_link} onChange={(e) => setForm({ ...form, portfolio_link: e.target.value })} placeholder="https://..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sample Works</Label>
                <p className="text-sm text-muted-foreground">Upload images of your work (PNG/JPG, up to 10MB each).</p>
                <div className="flex flex-wrap gap-2">
                  {form.sample_works_urls.map((url, i) => (
                    <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Sample ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, sample_works_urls: f.sample_works_urls.filter((_, idx) => idx !== i) }))}
                        className="absolute right-0 top-0 rounded-bl-md bg-background/80 p-1 text-rose-600 hover:bg-background"
                        aria-label="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {form.sample_works_urls.length < 8 && (
                  <FileUpload
                    value=""
                    onChange={(url) => setForm((f) => ({ ...f, sample_works_urls: [...f.sample_works_urls, url] }))}
                    accept="image/png,image/jpeg,image/webp"
                    maxSizeMb={10}
                    folder={`creative-apps/${user?.id || 'anon'}`}
                    kind="image"
                    label="Upload Sample"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Why should Twist Studio hire you? *</Label>
                <Textarea required rows={4} value={form.why_hire} onChange={(e) => setForm({ ...form, why_hire: e.target.value })} />
              </div>

              <Button type="submit" disabled={loading || form.skills.length === 0} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
