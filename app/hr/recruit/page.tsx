'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Copy, Check, Link as LinkIcon, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function RecruitPartnerPage() {
  const { profile } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/signup?role=hr`
    : '';

  const partnerInviteUrl = typeof window !== 'undefined' && profile?.id
    ? `${window.location.origin}/signup?role=partner&ref=${profile.id}`
    : '';

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setLoading(true);

    const { data: existing } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', form.email)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('profiles')
        .update({ recruited_by_hr_id: profile.id })
        .eq('id', existing.id);
      if (error) toast.error(error.message);
      else {
        toast.success(`${form.email} is now linked to you as their HR manager`);
        setForm({ full_name: '', email: '', phone: '', notes: '' });
      }
      setLoading(false);
      return;
    }

    toast.info('No account found for that email. Share the partner signup link with them instead.');
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Recruit a Partner</h2>
        <p className="text-muted-foreground">Invite new partners to join the platform under your recruitment.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5 text-primary" /> Share Signup Link</CardTitle>
            <CardDescription>Send this link to someone you want to recruit as a partner. When they sign up through this link, they will be automatically linked to your HR account — and you&apos;ll earn commission when their clients complete jobs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Partner Signup Link</Label>
              <div className="flex gap-2">
                <Input readOnly value={partnerInviteUrl} className="bg-muted/50" />
                <Button type="button" variant="outline" onClick={() => copyLink(partnerInviteUrl)}>
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Share this link with potential partners. Anyone who signs up through it is automatically linked to you as their HR manager — no manual step needed.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Link Existing Partner</CardTitle>
            <CardDescription>If a partner has already signed up, link them to your HR account by entering their email.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Partner Email</Label>
                <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="partner@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Partner Full Name (optional)</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="For your reference" />
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any notes about this partner" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? 'Linking...' : 'Link Partner to My Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
