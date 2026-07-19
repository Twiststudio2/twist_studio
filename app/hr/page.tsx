'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, DollarSign, TrendingUp, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDateTime } from '@/lib/data';

export default function HrOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ partners: 0, activePartners: 0, totalCommission: 0, pendingCommission: 0, paidCommission: 0 });
  const [recentPartners, setRecentPartners] = useState<any[]>([]);
  const [recentCommissions, setRecentCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    (async () => {
      const [partners, commissions] = await Promise.all([
        supabase.from('profiles').select('*').eq('recruited_by_hr_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('commissions').select('*, clients(client_name)').eq('hr_id', profile.id).order('created_at', { ascending: false }),
      ]);

      const partnerList = partners.data || [];
      const commList = commissions.data || [];

      setStats({
        partners: partnerList.length,
        activePartners: partnerList.filter((p) => p.status === 'active').length,
        totalCommission: commList.reduce((s, c) => s + Number(c.hr_amount || 0), 0),
        pendingCommission: commList.filter((c) => c.status === 'pending').reduce((s, c) => s + Number(c.hr_amount || 0), 0),
        paidCommission: commList.filter((c) => c.status === 'paid').reduce((s, c) => s + Number(c.hr_amount || 0), 0),
      });
      setRecentPartners(partnerList.slice(0, 5));
      setRecentCommissions(commList.slice(0, 5));
      setLoading(false);
    })();
  }, [profile?.id]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome, {profile?.full_name || 'HR Manager'}</h2>
        <p className="text-muted-foreground">Manage your recruited partners and track your commissions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Partners" value={stats.partners} color="blue" />
        <StatCard icon={UserPlus} label="Active Partners" value={stats.activePartners} color="emerald" />
        <StatCard icon={DollarSign} label="Total Commission" value={formatCurrency(stats.totalCommission)} color="amber" />
        <StatCard icon={TrendingUp} label="Paid Commission" value={formatCurrency(stats.paidCommission)} color="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Recently Recruited Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPartners.length > 0 ? recentPartners.map((p) => (
                <div key={p.id} className="flex items-center gap-3 border-b border-border/40 pb-3 last:border-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                    {p.full_name?.charAt(0) || p.email?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{p.full_name || 'Unnamed'}</div>
                    <div className="text-xs text-muted-foreground">{p.email}</div>
                  </div>
                  <Badge className={p.status === 'active' ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}>{p.status}</Badge>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No partners recruited yet. Use the Recruit Partner page to invite partners.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Recent Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCommissions.length > 0 ? recentCommissions.map((c) => (
                <div key={c.id} className="flex items-start gap-3 border-b border-border/40 pb-3 last:border-0">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{c.clients?.client_name || 'Client'}</div>
                    <div className="text-xs text-muted-foreground">{formatDateTime(c.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-emerald-700">{formatCurrency(c.hr_amount)}</div>
                    <Badge className={c.status === 'paid' ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}>{c.status}</Badge>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No commissions yet. You earn commission when your partners&apos; clients complete jobs.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
