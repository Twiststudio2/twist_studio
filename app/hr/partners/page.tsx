'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Ban, Power, CircleCheck as CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { formatDate } from '@/lib/data';

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-700 bg-emerald-100',
  suspended: 'text-amber-700 bg-amber-100',
  deactivated: 'text-stone-700 bg-stone-200',
};

export default function MyPartnersPage() {
  const { profile } = useAuth();
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPartners = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('recruited_by_hr_id', profile.id)
      .order('created_at', { ascending: false });
    setPartners(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPartners(); }, [profile?.id]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success(`Partner ${status}`); fetchPartners(); }
  };

  const filtered = partners.filter((p) =>
    (p.full_name || p.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Partners</h2>
        <p className="text-muted-foreground">Partners you have recruited ({partners.length} total).</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search partners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="p-4 text-left font-medium text-muted-foreground">Partner</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Joined</th>
                  <th className="p-4 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                          {p.full_name?.charAt(0) || p.email?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{p.full_name || 'Unnamed'}</div>
                          <div className="text-xs text-muted-foreground">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={STATUS_COLORS[p.status] || ''}>{p.status}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(p.created_at)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        {p.status !== 'active' && (
                          <Button size="icon" variant="ghost" onClick={() => updateStatus(p.id, 'active')} title="Reactivate">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </Button>
                        )}
                        {p.status !== 'suspended' && (
                          <Button size="icon" variant="ghost" onClick={() => updateStatus(p.id, 'suspended')} title="Suspend">
                            <Ban className="h-4 w-4 text-amber-600" />
                          </Button>
                        )}
                        {p.status !== 'deactivated' && (
                          <Button size="icon" variant="ghost" onClick={() => updateStatus(p.id, 'deactivated')} title="Deactivate">
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
              <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">No partners recruited yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
