'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CircleCheck as CheckCircle2, DollarSign, Trophy, TrendingUp, TriangleAlert as AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate } from '@/lib/data';
import { CLIENT_STATUS_CONFIG } from '@/lib/constants';

export default function PartnerOverview() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ submitted: 0, active: 0, completed: 0, commission: 0, rank: '—' });
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: clients } = await supabase.from('clients').select('*').eq('partner_id', user.id).order('created_at', { ascending: false });
      const all = clients || [];
      const completed = all.filter((c) => c.status === 'completed');
      const active = all.filter((c) => ['received', 'working', 'waiting'].includes(c.status));

      const { data: comms } = await supabase.from('commissions').select('amount').eq('partner_id', user.id).eq('status', 'paid');
      const totalCommission = (comms || []).reduce((sum, c) => sum + Number(c.amount), 0);

      const { data: allPartners } = await supabase.from('profiles').select('id').eq('role', 'partner');
      const partnerCount = (allPartners || []).length;
      const rank = partnerCount > 0 ? `#${Math.min(partnerCount, Math.ceil(all.length / 2) || partnerCount)}` : '—';

      setStats({
        submitted: all.length, active: active.length, completed: completed.length,
        commission: totalCommission, rank,
      });
      setRecentClients(all.slice(0, 5));
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back, {profile?.full_name || 'Partner'}</h2>
        <p className="text-muted-foreground">Here&apos;s your partnership overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Clients Submitted" value={stats.submitted} color="primary" />
        <StatCard icon={TrendingUp} label="Active Clients" value={stats.active} color="blue" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="emerald" />
        <StatCard icon={DollarSign} label="Commission Earned" value={formatCurrency(stats.commission)} color="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClients.length > 0 ? recentClients.map((c) => {
                const cfg = CLIENT_STATUS_CONFIG[c.status] || { label: c.status, color: '', bg: '' };
                return (
                  <div key={c.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0">
                    <div>
                      <div className="font-medium">{c.client_name}</div>
                      <div className="text-xs text-muted-foreground">{c.business_name || 'No business name'} · {formatDate(c.created_at)}</div>
                    </div>
                    <Badge className={cfg.bg + ' ' + cfg.color}>{cfg.label}</Badge>
                  </div>
                );
              }) : (
                <p className="text-sm text-muted-foreground">No clients submitted yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/60 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-6">
              <Trophy className="mb-3 h-8 w-8" />
              <div className="text-3xl font-bold">{stats.rank}</div>
              <div className="text-sm opacity-90">Current Ranking</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Partners who consistently perform poorly over time may have their partnership reviewed or terminated.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
