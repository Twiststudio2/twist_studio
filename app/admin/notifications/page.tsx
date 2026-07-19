'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send, Users, Palette, Loader as Loader2 } from 'lucide-react';
import { notifyUser, formatDateTime } from '@/lib/data';

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-500', success: 'bg-emerald-500', warning: 'bg-amber-500', error: 'bg-rose-500',
};

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [audience, setAudience] = useState('all_partners');
  const [specificUser, setSpecificUser] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', message: '', type: 'info' });

  useEffect(() => {
    (async () => {
      const [{ data: u }, { data: n }] = await Promise.all([
        supabase.from('profiles').select('id, email, full_name, role').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10),
      ]);
      setUsers(u || []);
      setRecent(n || []);
      setLoading(false);
    })();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      let recipients: any[] = [];
      if (audience === 'all_partners') {
        recipients = users.filter((u) => u.role === 'partner');
      } else if (audience === 'all_creatives') {
        recipients = users.filter((u) => u.role === 'creative');
      } else if (audience === 'specific' && specificUser) {
        recipients = users.filter((u) => u.id === specificUser);
      }

      if (recipients.length === 0) {
        toast.error('No recipients found');
        setSending(false);
        return;
      }

      const inserts = recipients.map((r) => ({
        user_id: r.id, title: form.title, message: form.message, type: form.type,
      }));
      const { error } = await supabase.from('notifications').insert(inserts);
      if (error) throw error;

      toast.success(`Notification sent to ${recipients.length} recipient(s)`);
      setForm({ title: '', message: '', type: 'info' });
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10);
      setRecent(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send');
    }
    setSending(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="text-muted-foreground">Send announcements to partners and creatives.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" /> Compose Announcement</CardTitle>
            <CardDescription>Choose your audience and write your message.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_partners">All Partners</SelectItem>
                    <SelectItem value="all_creatives">All Creatives</SelectItem>
                    <SelectItem value="specific">Specific User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {audience === 'specific' && (
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select value={specificUser} onValueChange={setSpecificUser}>
                    <SelectTrigger><SelectValue placeholder="Choose a user..." /></SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.full_name || u.email} ({u.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write your message..." />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={sending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Send Announcement</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Recent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent.length > 0 ? recent.map((n) => (
                <div key={n.id} className="border-b border-border/40 pb-3 last:border-0">
                  <div className="flex items-start gap-2">
                    <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_COLORS[n.type] || 'bg-blue-500'}`} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{n.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{n.message}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{formatDateTime(n.created_at)}</div>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No notifications sent yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
