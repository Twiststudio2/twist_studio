'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDateTime } from '@/lib/data';

export default function HrCommissionsPage() {
  const { profile } = useAuth();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, pending: 0, paid: 0, approved: 0 });

  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('commissions')
      .select('*, clients(client_name), profiles:partner_id(full_name, email)')
      .eq('hr_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCommissions(data || []);
        const list = data || [];
        setSummary({
          total: list.reduce((s, c) => s + Number(c.hr_amount || 0), 0),
          pending: list.filter((c) => c.status === 'pending').reduce((s, c) => s + Number(c.hr_amount || 0), 0),
          approved: list.filter((c) => c.status === 'approved').reduce((s, c) => s + Number(c.hr_amount || 0), 0),
          paid: list.filter((c) => c.status === 'paid').reduce((s, c) => s + Number(c.hr_amount || 0), 0),
        });
        setLoading(false);
      });
  }, [profile?.id]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Commissions</h2>
        <p className="text-muted-foreground">Commission earned when your recruited partners&apos; clients complete jobs.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><DollarSign className="h-4 w-4" /> Total Earned</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(summary.total)}</div></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Clock className="h-4 w-4" /> Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{formatCurrency(summary.pending)}</div></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><TrendingUp className="h-4 w-4" /> Approved</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.approved)}</div></CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Wallet className="h-4 w-4" /> Paid</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.paid)}</div></CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader><CardTitle>Commission History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="p-4 text-left font-medium text-muted-foreground">Partner</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Client</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Amount</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id} className="border-b border-border/40 last:border-0">
                    <td className="p-4">{c.profiles?.full_name || c.profiles?.email || 'Unknown'}</td>
                    <td className="p-4">{c.clients?.client_name || 'N/A'}</td>
                    <td className="p-4 font-semibold text-emerald-700">{formatCurrency(c.hr_amount)}</td>
                    <td className="p-4">
                      <Badge className={c.status === 'paid' ? 'text-emerald-700 bg-emerald-100' : c.status === 'approved' ? 'text-blue-700 bg-blue-100' : 'text-amber-700 bg-amber-100'}>{c.status}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDateTime(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {commissions.length === 0 && (
            <div className="py-16 text-center">
              <DollarSign className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">No commissions yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
