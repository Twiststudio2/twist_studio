'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { UserCog, Plus, Copy, Check, Link as LinkIcon, Mail, Users, Ban, Power, CircleCheck as CheckCircle2, Search } from 'lucide-react';
import { formatDate } from '@/lib/data';
import { useAuth } from '@/lib/auth-context';

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-700 bg-emerald-100',
  suspended: 'text-amber-700 bg-amber-100',
  deactivated: 'text-stone-700 bg-stone-200',
};

export default function HrManagementPage() {
  const { profile } = useAuth();
  const [hrManagers, setHrManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newHr, setNewHr] = useState({ email: '', password: '', full_name: '' });

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/signup?role=hr`
    : '';

  const fetchHrManagers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, recruited_partners:profiles!recruited_by_hr_id(id)')
      .eq('role', 'hr')
      .order('created_at', { ascending: false });
    setHrManagers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchHrManagers(); }, []);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('HR invite link copied to clipboard');
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success(`HR manager ${status}`); fetchHrManagers(); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.admin.createUser({
      email: newHr.email,
      password: newHr.password,
      user_metadata: { full_name: newHr.full_name, role: 'hr' },
    });
    if (error) { toast.error('Use the invite link instead — admin user creation requires service role key.'); return; }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id, email: newHr.email, full_name: newHr.full_name, role: 'hr',
      });
      toast.success('HR manager created');
      setCreateOpen(false);
      setNewHr({ email: '', password: '', full_name: '' });
      fetchHrManagers();
    }
  };

  const filtered = hrManagers.filter((h) =>
    (h.full_name || h.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">HR Managers</h2>
          <p className="text-muted-foreground">Manage HR managers who recruit partners and earn commissions.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" /> Create HR</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create HR Manager</DialogTitle>
              <DialogDescription>Create a new HR manager account.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input required value={newHr.full_name} onChange={(e) => setNewHr({ ...newHr, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" required value={newHr.email} onChange={(e) => setNewHr({ ...newHr, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" required value={newHr.password} onChange={(e) => setNewHr({ ...newHr, password: e.target.value })} />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Create HR Manager</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/60 bg-teal-50/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><LinkIcon className="h-5 w-5 text-teal-600" /> HR Invite Link</CardTitle>
          <CardDescription>Send this link to someone you want to invite as an HR manager. They&apos;ll sign up and get access to the HR dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input readOnly value={inviteUrl} className="bg-background" />
            <Button onClick={copyInviteLink} variant="outline" className="shrink-0">
              {copied ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search HR managers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="p-4 text-left font-medium text-muted-foreground">HR Manager</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Partners Recruited</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Joined</th>
                  <th className="p-4 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id} className="border-b border-border/40 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                          {h.full_name?.charAt(0) || h.email?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{h.full_name || 'Unnamed'}</div>
                          <div className="text-xs text-muted-foreground">{h.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className="text-teal-700 bg-teal-100">{h.recruited_partners?.length || 0}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={STATUS_COLORS[h.status] || ''}>{h.status}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(h.created_at)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        {h.status !== 'active' && (
                          <Button size="icon" variant="ghost" onClick={() => updateStatus(h.id, 'active')} title="Reactivate">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </Button>
                        )}
                        {h.status !== 'suspended' && (
                          <Button size="icon" variant="ghost" onClick={() => updateStatus(h.id, 'suspended')} title="Suspend">
                            <Ban className="h-4 w-4 text-amber-600" />
                          </Button>
                        )}
                        {h.status !== 'deactivated' && (
                          <Button size="icon" variant="ghost" onClick={() => updateStatus(h.id, 'deactivated')} title="Deactivate">
                            <Power className="h-4 w-4 text-rose-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <UserCog className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">No HR managers yet. Use the invite link above to add one.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
