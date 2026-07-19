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
import { Loader as Loader2, Upload, ArrowRight, CircleCheck as CheckCircle2, Clock, Circle as XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { APP_STATUS_CONFIG } from '@/lib/constants';

export default function PartnerApplicationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<any>(null);
  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', gender: '', nationality: '', region: '',
    town_city: '', phone: '', occupation: '', emergency_contact: '',
    why_join: '', how_help: '', profile_picture_url: '', confirmed_communicator: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signup');
    }
    if (user) {
      supabase.from('partner_applications').select('*').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => { if (data) setExisting(data); });
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('partner_applications').insert({
      ...form, user_id: user.id,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Application submitted! We\'ll review it shortly.');
      const { data } = await supabase.from('partner_applications').select('*').eq('user_id', user.id).maybeSingle();
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
              {existing.status === 'pending' && 'Your application is under review. We\'ll notify you once a decision is made.'}
              {existing.status === 'approved' && 'Congratulations! Your application has been approved. You can now access your partner dashboard.'}
              {existing.status === 'rejected' && 'Unfortunately, your application was not approved at this time.'}
              {existing.status === 'suspended' && 'Your application has been suspended. Please contact support.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {existing.status === 'approved' ? (
              <Button onClick={() => router.push('/partner')} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => router.push('/')} variant="outline" className="w-full" size="lg">
                Back to Home
              </Button>
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
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Partner Application</h1>
          <p className="mt-2 text-muted-foreground">Complete this form to apply as a Twist Studio partner.</p>
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
                  <Label>Gender</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select...</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} placeholder="Ghanaian" />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Greater Accra" />
                </div>
                <div className="space-y-2">
                  <Label>Town/City</Label>
                  <Input value={form.town_city} onChange={(e) => setForm({ ...form, town_city: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+233 ..." />
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} placeholder="Name and phone" />
              </div>
              <div className="space-y-2">
                <Label>Why do you want to join Twist Studio? *</Label>
                <Textarea required rows={3} value={form.why_join} onChange={(e) => setForm({ ...form, why_join: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>How can you help Twist Studio grow? *</Label>
                <Textarea required rows={3} value={form.how_help} onChange={(e) => setForm({ ...form, how_help: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Profile Picture URL</Label>
                <Input value={form.profile_picture_url} onChange={(e) => setForm({ ...form, profile_picture_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
                <Checkbox id="confirm" checked={form.confirmed_communicator} onCheckedChange={(v) => setForm({ ...form, confirmed_communicator: v as boolean })} />
                <label htmlFor="confirm" className="text-sm text-muted-foreground">
                  I confirm that I am a good communicator and will professionally represent Twist Studio.
                </label>
              </div>
              <Button type="submit" disabled={loading || !form.confirmed_communicator} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
