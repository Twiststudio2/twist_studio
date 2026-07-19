'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, Briefcase, CircleCheck as CheckCircle2, Clock, Palette, Bell, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDateTime } from '@/lib/data';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    revenue: 0, clients: 0, activeProjects: 0, completedProjects: 0,
    pendingProjects: 0, partners: 0, creatives: 0, applications: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [clients, partners, creatives, pa, ca] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('profiles').select('*').eq('role', 'partner'),
        supabase.from('profiles').select('*').eq('role', 'creative'),
        supabase.from('partner_applications').select('*').eq('status', 'pending'),
        supabase.from('creative_applications').select('*').eq('status', 'pending'),
      ]);

      const allClients = clients.data || [];
      const completed = allClients.filter((c) => c.status === 'completed');
      const active = allClients.filter((c) => ['received', 'working', 'waiting'].includes(c.status));
      const pending = allClients.filter((c) => c.status === 'pending');

      setStats({
        revenue: completed.length * 1500,
        clients: allClients.length,
        activeProjects: active.length,
        completedProjects: completed.length,
        pendingProjects: pending.length,
        partners: (partners.data || []).length,
        creatives: (creatives.data || []).length,
        applications: (pa.data || []).length + (ca.data || []).length,
      });

      const { data: notifs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(8);
      setRecentActivity(notifs || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back, Admin</h2>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening at Twist Studio.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats.revenue)} color="emerald" />
        <StatCard icon={Users} label="Total Clients" value={stats.clients} color="blue" />
        <StatCard icon={Briefcase} label="Active Projects" value={stats.activeProjects} color="violet" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completedProjects} color="emerald" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Clock} label="Pending Projects" value={stats.pendingProjects} color="amber" />
        <StatCard icon={Users} label="Partners" value={stats.partners} color="primary" />
        <StatCard icon={Palette} label="Creatives" value={stats.creatives} color="accent" />
        <StatCard icon={Bell} label="Applications" value={stats.applications} color="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Monthly Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, i) => {
                const value = [40, 55, 70, 60, 85, 95, 100][i];
                return (
                  <div key={month} className="flex items-center gap-3">
                    <div className="w-10 text-sm text-muted-foreground">{month}</div>
                    <div className="flex-1">
                      <div className="h-6 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium">{value}%</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 border-b border-border/40 pb-3 last:border-0">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{formatDateTime(a.created_at)}</div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
