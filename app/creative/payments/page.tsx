'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard-layout';
import { DollarSign, CircleCheck as CheckCircle2, Clock, Wallet } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/data';

export default function CreativePaymentsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('creative_jobs').select('*').eq('creative_id', user.id).order('created_at', { ascending: false });
      setJobs(data || []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  const paid = jobs.filter((j) => j.payment_status === 'paid');
  const pending = jobs.filter((j) => j.payment_status === 'pending' && j.status === 'completed');
  const totalEarned = paid.reduce((s, j) => s + Number(j.payment_amount || 0), 0);
  const totalPending = pending.reduce((s, j) => s + Number(j.payment_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payments</h2>
        <p className="text-muted-foreground">Track your earnings and payment status.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Total Earned" value={formatCurrency(totalEarned)} color="emerald" />
        <StatCard icon={CheckCircle2} label="Paid Jobs" value={paid.length} color="primary" />
        <StatCard icon={Clock} label="Pending Payment" value={formatCurrency(totalPending)} color="amber" />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Job</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Amount</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {jobs.filter((j) => j.payment_amount).length > 0 ? jobs.filter((j) => j.payment_amount).map((job) => (
                  <tr key={job.id} className="border-b border-border/40 last:border-0">
                    <td className="py-3 font-medium">{job.title}</td>
                    <td className="py-3">{formatCurrency(job.payment_amount)}</td>
                    <td className="py-3">
                      <Badge className={job.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                        {job.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatDate(job.created_at)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No payment records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
