'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, UserCog, Plus, Ban, Power, CircleCheck as CheckCircle2, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/data';

const ROLE_COLORS: Record<string, string> = {
  admin: 'text-rose-700 bg-rose-100',
  partner: 'text-primary bg-primary/10',
  creative: 'text-accent bg-accent/10',
  hr: 'text-teal-700 bg-teal-100',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-700 bg-emerald-100',
  suspended: 'text-amber-700 bg-amber-100',
  deactivated: 'text-stone-700 bg-stone-200',
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'partner' });

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success(`User ${status}`); fetchUsers(); }
  };

  const updateRole = async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Role updated'); fetchUsers(); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.admin.createUser({
      email: newUser.email,
      password: newUser.password,
      user_metadata: { full_name: newUser.full_name, role: newUser.role },
    });
    if (error) { toast.error('Note: Admin user creation requires service role. Use signup flow instead.'); return; }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id, email: newUser.email, full_name: newUser.full_name, role: newUser.role,
      });
      toast.success('User created');
      setCreateOpen(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'partner' });
      fetchUsers();
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = (u.full_name || u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || u.role === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage all users, roles, and permissions.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" /> Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new admin, partner, or creative.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input required value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" required value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" required value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr">HR Manager</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Create User</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="hr">HR Manager</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="creative">Creative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="p-4 text-left font-medium text-muted-foreground">User</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Role</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Joined</th>
                  <th className="p-4 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border/40 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {u.full_name?.charAt(0) || u.email?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{u.full_name || 'Unnamed'}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Select value={u.role} onValueChange={(v) => updateRole(u.id, v)}>
                        <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="hr">HR Manager</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      <Badge className={STATUS_COLORS[u.status] || ''}>{u.status}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(u.created_at)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        {u.status !== 'active' && (
                          <Button size="icon" variant="ghost" onClick={() => updateStatus(u.id, 'active')} title="Reactivate">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </Button>
                        )}
                        {u.status !== 'suspended' && (
                          <Button size="icon" variant="ghost" onClick={() => updateStatus(u.id, 'suspended')} title="Suspend">
                            <Ban className="h-4 w-4 text-amber-600" />
                          </Button>
                        )}
                        {u.status !== 'deactivated' && (
                          <Button size="icon" variant="ghost" onClick={() => updateStatus(u.id, 'deactivated')} title="Deactivate">
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
              <p className="text-muted-foreground">No users found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
