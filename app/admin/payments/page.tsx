'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, type CreativeJob, type Commission, type Profile } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CreditCard, DollarSign, FileText, Check, Receipt } from 'lucide-react';

type CreativeJobRow = CreativeJob & {
  creative?: { full_name: string | null; email: string } | null;
};

type CommissionRow = Commission & {
  partner?: { full_name: string | null; email: string } | null;
};

export default function PaymentsAdminPage() {
  const [jobs, setJobs] = useState<CreativeJobRow[]>([]);
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [jRes, cRes] = await Promise.all([
      supabase
        .from('creative_jobs')
        .select('*, creative:profiles!creative_id(full_name, email)')
        .order('created_at', { ascending: false }),
      supabase
        .from('commissions')
        .select('*, partner:profiles!partner_id(full_name, email)')
        .eq('status', 'paid')
        .order('paid_at', { ascending: false }),
    ]);

    if (jRes.error) {
      toast.error('Failed to load creative jobs');
    } else {
      setJobs((jRes.data || []) as unknown as CreativeJobRow[]);
    }
    if (cRes.error) {
      toast.error('Failed to load commissions');
    } else {
      setCommissions((cRes.data || []) as unknown as CommissionRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalCreative = jobs
    .filter((j) => j.payment_status === 'paid')
    .reduce((sum, j) => sum + Number(j.payment_amount || 0), 0);
  const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const handleMarkPaid = async (job: CreativeJobRow) => {
    setActionLoading(job.id);
    const { error } = await supabase
      .from('creative_jobs')
      .update({ payment_status: 'paid' })
      .eq('id', job.id);

    if (error) {
      toast.error('Failed to mark as paid');
    } else {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, payment_status: 'paid' } : j))
      );
      toast.success('Marked as paid', {
        description: `${job.creative?.full_name || 'Creative'} — ${formatCurrency(job.payment_amount)}`,
      });
    }
    setActionLoading(null);
  };

  const handleReceipt = (label: string) => {
    toast.success('Receipt generated', { description: label });
  };

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
          <CreditCard className="h-6 w-6 text-primary" />
          Payments
        </h2>
        <p className="text-muted-foreground">Record creative payments and review commission payouts.</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DollarSign className="h-4 w-4" />
          </div>
          <div className="text-xl font-bold">{formatCurrency(totalCreative)}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Creative Payments (Paid)</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="text-xl font-bold">{formatCurrency(totalCommissions)}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Commissions Paid</div>
        </div>
      </div>

      <Tabs defaultValue="creative">
        <TabsList>
          <TabsTrigger value="creative">
            <DollarSign className="mr-2 h-4 w-4" />
            Creative Payments
          </TabsTrigger>
          <TabsTrigger value="partner">
            <CreditCard className="mr-2 h-4 w-4" />
            Partner Commissions
          </TabsTrigger>
        </TabsList>

        {/* Creative payments */}
        <TabsContent value="creative" className="space-y-4">
          {jobs.length === 0 ? (
            <Card className="border-dashed border-border/70">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-secondary p-4">
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No creative jobs yet</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Creative jobs with payment details will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/60">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Creative</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="font-medium">{job.creative?.full_name || '—'}</div>
                          <div className="text-xs text-muted-foreground">{job.creative?.email}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{job.title}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(job.payment_amount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={job.payment_status === 'paid' ? 'default' : 'secondary'}
                            className={cn(
                              job.payment_status === 'paid'
                                ? 'bg-primary/10 text-primary hover:bg-primary/10'
                                : 'bg-accent/10 text-accent hover:bg-accent/10'
                            )}
                          >
                            {job.payment_status === 'paid' ? (
                              <Check className="mr-1 h-3 w-3" />
                            ) : null}
                            {job.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {formatDate(job.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {job.payment_status === 'pending' && (
                              <Button
                                size="sm"
                                className="h-8 gap-1.5 bg-primary hover:bg-primary/90"
                                onClick={() => handleMarkPaid(job)}
                                disabled={actionLoading === job.id}
                              >
                                <Check className="h-4 w-4" />
                                {actionLoading === job.id ? 'Paying…' : 'Mark as Paid'}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5"
                              onClick={() =>
                                handleReceipt(`${job.creative?.full_name || 'Creative'} — ${job.title}`)
                              }
                            >
                              <Receipt className="h-4 w-4" /> Receipt
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Partner commissions */}
        <TabsContent value="partner" className="space-y-4">
          {commissions.length === 0 ? (
            <Card className="border-dashed border-border/70">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-secondary p-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No commission payouts yet</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Commissions marked as paid will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/60">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((comm) => (
                      <TableRow key={comm.id}>
                        <TableCell>
                          <div className="font-medium">{comm.partner?.full_name || '—'}</div>
                          <div className="text-xs text-muted-foreground">{comm.partner?.email}</div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(comm.amount)}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {formatDate(comm.paid_at || comm.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5"
                            onClick={() => handleReceipt(`${comm.partner?.full_name || 'Partner'} commission`)}
                          >
                            <Receipt className="h-4 w-4" /> Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
