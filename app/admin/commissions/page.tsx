'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, type Commission } from '@/lib/supabase';
import { COMMISSION_STATUS_CONFIG } from '@/lib/constants';
import { formatCurrency, formatDate, notifyUser } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { DollarSign, Check, CreditCard, Plus, Settings } from 'lucide-react';

type CommissionRow = Commission & {
  partner?: { full_name: string | null; email: string } | null;
  client?: { client_name: string | null; business_name: string | null } | null;
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'paid', label: 'Paid' },
] as const;

type PartnerOption = { id: string; full_name: string | null; email: string };
type ClientOption = { id: string; client_name: string; business_name: string | null };

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

export default function CommissionsAdminPage() {
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [defaultPercentage, setDefaultPercentage] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Settings dialog
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsValue, setSettingsValue] = useState('10');
  const [savingSettings, setSavingSettings] = useState(false);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    partnerId: '',
    amount: '',
    percentage: '',
    clientId: '',
    notes: '',
  });
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [commRes, partnersRes, clientsRes, settingsRes] = await Promise.all([
      supabase
        .from('commissions')
        .select('*, partner:profiles!partner_id(full_name, email), client:clients!client_id(client_name, business_name)')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, email').eq('role', 'partner').order('full_name', { ascending: true }),
      supabase.from('clients').select('id, client_name, business_name').order('client_name', { ascending: true }),
      supabase.from('commission_settings').select('*').limit(1),
    ]);

    if (commRes.error) {
      toast.error('Failed to load commissions');
    } else {
      setCommissions((commRes.data || []) as unknown as CommissionRow[]);
    }

    setPartners((partnersRes.data as PartnerOption[]) || []);
    setClients((clientsRes.data as ClientOption[]) || []);

    const setting = (settingsRes.data && settingsRes.data[0]) as { percentage: number } | undefined;
    if (setting) {
      setDefaultPercentage(setting.percentage);
      setSettingsValue(String(setting.percentage));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = commissions.filter((c) => filter === 'all' || c.status === filter);

  const updateLocalStatus = (id: string, status: string, paidAt?: string | null) => {
    setCommissions((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: status as Commission['status'], paid_at: paidAt ?? c.paid_at }
          : c
      )
    );
  };

  const handleApprove = async (comm: CommissionRow) => {
    setActionLoading(`approve-${comm.id}`);
    const { error } = await supabase
      .from('commissions')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', comm.id);

    if (error) {
      toast.error('Failed to approve commission');
    } else {
      updateLocalStatus(comm.id, 'approved');
      toast.success('Commission approved');
      if (comm.partner_id) {
        await notifyUser(
          comm.partner_id,
          'Commission Approved',
          `Your commission of ${formatCurrency(comm.amount)} (${comm.percentage}%) has been approved.`,
          'success',
          '/partner'
        );
      }
    }
    setActionLoading(null);
  };

  const handleMarkPaid = async (comm: CommissionRow) => {
    setActionLoading(`paid-${comm.id}`);
    const paidAt = new Date().toISOString();
    const { error } = await supabase
      .from('commissions')
      .update({ status: 'paid', paid_at: paidAt, updated_at: paidAt })
      .eq('id', comm.id);

    if (error) {
      toast.error('Failed to mark as paid');
    } else {
      updateLocalStatus(comm.id, 'paid', paidAt);
      toast.success('Commission marked as paid');
      if (comm.partner_id) {
        await notifyUser(
          comm.partner_id,
          'Commission Paid 💰',
          `Your commission of ${formatCurrency(comm.amount)} (${comm.percentage}%) has been paid out.`,
          'success',
          '/partner'
        );
      }
    }
    setActionLoading(null);
  };

  const handleSaveSettings = async () => {
    const val = parseFloat(settingsValue);
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error('Enter a valid percentage between 0 and 100');
      return;
    }

    setSavingSettings(true);
    // Try to update existing row; if none, insert.
    const { data: existing } = await supabase.from('commission_settings').select('id').limit(1);
    let error;

    if (existing && existing.length > 0) {
      ({ error } = await supabase
        .from('commission_settings')
        .update({ percentage: val, updated_at: new Date().toISOString() })
        .eq('id', existing[0].id));
    } else {
      ({ error } = await supabase.from('commission_settings').insert({ percentage: val }));
    }

    if (error) {
      toast.error('Failed to save commission rate');
    } else {
      setDefaultPercentage(val);
      toast.success(`Default commission rate set to ${val}%`);
      setSettingsOpen(false);
    }
    setSavingSettings(false);
  };

  const openCreate = () => {
    setCreateForm({
      partnerId: '',
      amount: '',
      percentage: String(defaultPercentage),
      clientId: '',
      notes: '',
    });
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.partnerId) {
      toast.error('Please select a partner');
      return;
    }
    const amount = parseFloat(createForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    const percentage = parseFloat(createForm.percentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast.error('Enter a valid percentage (0–100)');
      return;
    }

    setCreating(true);
    const payload = {
      partner_id: createForm.partnerId,
      amount,
      percentage,
      client_id: createForm.clientId || null,
      notes: createForm.notes.trim() || null,
      status: 'pending' as const,
    };

    const { error } = await supabase.from('commissions').insert(payload);

    if (error) {
      toast.error('Failed to create commission');
    } else {
      toast.success('Commission created');
      setCreateOpen(false);
      fetchData();
    }
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const counts = FILTERS.reduce<Record<string, number>>((acc, f) => {
    acc[f.key] = f.key === 'all' ? commissions.length : commissions.filter((c) => c.status === f.key).length;
    return acc;
  }, {});

  const totalPaid = commissions.filter((c) => c.status === 'paid').reduce((sum, c) => sum + Number(c.amount), 0);
  const totalPending = commissions.filter((c) => c.status === 'pending' || c.status === 'approved').reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <DollarSign className="h-6 w-6 text-primary" />
            Commissions
          </h2>
          <p className="text-muted-foreground">Manage partner commissions and payout settings.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Rate ({defaultPercentage}%)
          </Button>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Commission
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="text-xl font-bold">{formatCurrency(totalPaid)}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Paid</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <DollarSign className="h-4 w-4" />
          </div>
          <div className="text-xl font-bold">{formatCurrency(totalPending)}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Outstanding</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings className="h-4 w-4" />
          </div>
          <div className="text-xl font-bold">{defaultPercentage}%</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Default Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? 'default' : 'outline'}
            onClick={() => setFilter(f.key)}
            className={cn(filter === f.key && 'bg-primary hover:bg-primary/90')}
          >
            {f.label}
            <Badge variant="secondary" className="ml-2 border-transparent bg-background/20 px-1.5 py-0 text-[10px]">
              {counts[f.key]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-secondary p-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No commissions found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {commissions.length === 0
                ? 'Create a new commission to get started.'
                : 'No commissions match your current filter.'}
            </p>
            {commissions.length === 0 && (
              <Button onClick={openCreate} className="mt-5 bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> New Commission
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead className="hidden md:table-cell">Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((comm) => {
                  const cfg = COMMISSION_STATUS_CONFIG[comm.status] || {
                    label: comm.status,
                    color: 'text-stone-700',
                    bg: 'bg-stone-100 border-stone-200',
                  };
                  return (
                    <TableRow key={comm.id}>
                      <TableCell>
                        <div className="font-medium">{comm.partner?.full_name || '—'}</div>
                        <div className="text-xs text-muted-foreground">{comm.partner?.email}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {comm.client?.client_name || '—'}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(comm.amount)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {comm.percentage}%
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className={cn('border-0 font-medium', cfg.bg, cfg.color)}>
                            {cfg.label}
                          </Badge>
                          {comm.status === 'paid' && comm.paid_at && (
                            <div className="mt-1 text-xs text-muted-foreground">{formatDate(comm.paid_at)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(comm.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {comm.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 gap-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => handleApprove(comm)}
                              disabled={actionLoading === `approve-${comm.id}`}
                            >
                              <Check className="h-4 w-4" /> Approve
                            </Button>
                          )}
                          {(comm.status === 'pending' || comm.status === 'approved') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 gap-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => handleMarkPaid(comm)}
                              disabled={actionLoading === `paid-${comm.id}`}
                            >
                              <CreditCard className="h-4 w-4" /> Mark Paid
                            </Button>
                          )}
                          {comm.status === 'paid' && (
                            <span className="text-xs text-muted-foreground">Completed</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Commission Rate
            </DialogTitle>
            <DialogDescription>
              Set the default commission percentage applied to new commissions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="comm-rate">Default Percentage (%)</Label>
              <Input
                id="comm-rate"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={settingsValue}
                onChange={(e) => setSettingsValue(e.target.value)}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                This rate is used as a default when creating new commission records.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)} disabled={savingSettings}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={savingSettings} className="bg-primary hover:bg-primary/90">
              {savingSettings ? 'Saving…' : 'Save Rate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              New Commission
            </DialogTitle>
            <DialogDescription>Create a new commission record for a partner.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Partner */}
            <div className="grid gap-2">
              <Label>
                Partner <span className="text-destructive">*</span>
              </Label>
              <Select
                value={createForm.partnerId}
                onValueChange={(v) => setCreateForm((p) => ({ ...p, partnerId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a partner…" />
                </SelectTrigger>
                <SelectContent>
                  {partners.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No partners available
                    </SelectItem>
                  ) : (
                    partners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.full_name || p.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Amount + Percentage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  Amount (GHS) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={createForm.amount}
                  onChange={(e) => setCreateForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Percentage (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={createForm.percentage}
                  onChange={(e) => setCreateForm((p) => ({ ...p, percentage: e.target.value }))}
                  placeholder="10"
                />
              </div>
            </div>

            {/* Client */}
            <div className="grid gap-2">
              <Label>Client (optional)</Label>
              <Select
                value={createForm.clientId}
                onValueChange={(v) => setCreateForm((p) => ({ ...p, clientId: v === '_none' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Link to a client…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">No client</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.client_name}
                      {c.business_name ? ` — ${c.business_name}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="comm-notes">Notes</Label>
              <Textarea
                id="comm-notes"
                rows={3}
                value={createForm.notes}
                onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Optional notes about this commission…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-primary hover:bg-primary/90">
              {creating ? 'Creating…' : 'Create Commission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
