'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ChartBar as BarChart3, Download, TrendingUp, Users, DollarSign, FileText } from 'lucide-react';

type Stats = {
  totalRevenue: number;
  totalClients: number;
  commissionsPaid: number;
  creativePayments: number;
};

type ReportType = {
  key: string;
  label: string;
  icon: any;
  color: string;
};

const REPORT_TYPES: ReportType[] = [
  { key: 'partners', label: 'Partners', icon: Users, color: 'bg-primary/10 text-primary' },
  { key: 'creatives', label: 'Creatives', icon: Users, color: 'bg-accent/10 text-accent' },
  { key: 'revenue', label: 'Revenue', icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
  { key: 'projects', label: 'Projects', icon: FileText, color: 'bg-blue-100 text-blue-600' },
  { key: 'commissions', label: 'Commissions', icon: DollarSign, color: 'bg-violet-100 text-violet-600' },
  { key: 'payments', label: 'Payments', icon: DollarSign, color: 'bg-amber-100 text-amber-600' },
  { key: 'growth', label: 'Monthly Growth', icon: TrendingUp, color: 'bg-rose-100 text-rose-600' },
];

const MONTHLY_DATA = [
  { month: 'Jan', value: 40 },
  { month: 'Feb', value: 55 },
  { month: 'Mar', value: 70 },
  { month: 'Apr', value: 60 },
  { month: 'May', value: 85 },
  { month: 'Jun', value: 95 },
  { month: 'Jul', value: 100 },
];

export default function ReportsAdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalClients: 0,
    commissionsPaid: 0,
    creativePayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const [clients, commissions, jobs] = await Promise.all([
      supabase.from('clients').select('estimated_budget'),
      supabase.from('commissions').select('amount, status'),
      supabase.from('creative_jobs').select('payment_amount, payment_status'),
    ]);

    const allClients = (clients.data || []) as { estimated_budget: number | null }[];
    const allCommissions = (commissions.data || []) as {
      amount: number;
      status: 'pending' | 'approved' | 'paid';
    }[];
    const allJobs = (jobs.data || []) as {
      payment_amount: number | null;
      payment_status: 'pending' | 'paid';
    }[];

    const totalRevenue = allClients.reduce((sum, c) => sum + Number(c.estimated_budget || 0), 0);
    const commissionsPaid = allCommissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const creativePayments = allJobs
      .filter((j) => j.payment_status === 'paid')
      .reduce((sum, j) => sum + Number(j.payment_amount || 0), 0);

    setStats({
      totalRevenue,
      totalClients: allClients.length,
      commissionsPaid,
      creativePayments,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleGenerate = (report: ReportType) => {
    setGenerating(report.key);
    toast.success('Report generated', { description: `${report.label} report is ready to download` });
    setTimeout(() => setGenerating(null), 700);
  };

  const summaryCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'bg-primary/10 text-primary' },
    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Commissions Paid', value: formatCurrency(stats.commissionsPaid), icon: DollarSign, color: 'bg-violet-100 text-violet-600' },
    { label: 'Creative Payments', value: formatCurrency(stats.creativePayments), icon: DollarSign, color: 'bg-accent/10 text-accent' },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <BarChart3 className="h-6 w-6 text-primary" />
          Reports
        </h2>
        <p className="text-muted-foreground">Overview statistics and downloadable reports.</p>
      </div>

      {/* Summary stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-card p-5">
            <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-lg', s.color)}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Report type cards */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {REPORT_TYPES.map((r) => (
              <div
                key={r.key}
                className="flex flex-col rounded-xl border border-border/60 bg-card p-4"
              >
                <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-lg', r.color)}>
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{r.label}</div>
                  <div className="text-xs text-muted-foreground">Full breakdown report</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 h-8 gap-1.5"
                  onClick={() => handleGenerate(r)}
                  disabled={generating === r.key}
                >
                  <Download className="h-4 w-4" />
                  {generating === r.key ? 'Generating…' : 'Generate'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly growth bar chart */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Monthly Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-56 items-end justify-between gap-2 sm:gap-4">
            {MONTHLY_DATA.map((m) => (
              <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex w-full items-end justify-center">
                  <div
                    className="w-full max-w-[2.5rem] rounded-t-md bg-primary transition-all"
                    style={{ height: `${m.value}%` }}
                  />
                </div>
                <div className="text-xs font-medium text-muted-foreground">{m.month}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
