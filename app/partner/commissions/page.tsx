'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, CircleCheck as CheckCircle2, Clock, Loader as Loader2 } from 'lucide-react';
import { supabase, Commission, Client } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate } from '@/lib/data';
import { COMMISSION_STATUS_CONFIG } from '@/lib/constants';

type CommissionRow = Commission & { clients?: { client_name: string } | null };

export default function PartnerCommissionsPage() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('commissions')
        .select('*, clients:client_id (client_name)')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false });
      setCommissions((data as CommissionRow[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const summary = (() => {
    let completedJobs = 0;
    let earned = 0;
    let paid = 0;
    let pending = 0;
    for (const c of commissions) {
      completedJobs += 1;
      if (c.status === 'paid') {
        earned += Number(c.amount);
        paid += Number(c.amount);
      } else if (c.status === 'pending') {
        pending += Number(c.amount);
      }
    }
    return { completedJobs, earned, paid, pending };
  })();

  const summaryCards = [
    {
      icon: CheckCircle2,
      label: 'Completed Jobs',
      value: summary.completedJobs,
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: TrendingUp,
      label: 'Commission Earned',
      value: formatCurrency(summary.earned),
      iconBg: 'bg-primary/10 text-primary',
    },
    {
      icon: DollarSign,
      label: 'Commission Paid',
      value: formatCurrency(summary.paid),
      iconBg: 'bg-accent/10 text-accent',
    },
    {
      icon: Clock,
      label: 'Pending Commission',
      value: formatCurrency(summary.pending),
      iconBg: 'bg-amber-100 text-amber-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <DollarSign className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Commission Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Track your earnings and payment status across all completed projects.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="p-5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${s.iconBg}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commission History */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <DollarSign className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No commissions yet</p>
                <p className="text-sm text-muted-foreground">
                  Commissions will appear here once your referred clients complete projects.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((c) => {
                  const cfg = COMMISSION_STATUS_CONFIG[c.status] || {
                    label: c.status,
                    color: 'text-stone-700',
                    bg: 'bg-stone-100 border-stone-200',
                  };
                  const clientName = c.clients?.client_name || 'Unknown Client';
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{clientName}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatCurrency(c.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.percentage}%</TableCell>
                      <TableCell>
                        <Badge className={`${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(c.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
