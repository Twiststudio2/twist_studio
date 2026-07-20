'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, type Client } from '@/lib/supabase';
import { CLIENT_STATUS_CONFIG } from '@/lib/constants';
import { notifyUser, formatCurrency, formatDate } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

import { Users, Search, Eye, Filter, RefreshCw } from 'lucide-react';

type ClientRow = Client & {
  partner?: { full_name: string | null; email: string } | null;
};

const STATUS_OPTIONS = Object.entries(CLIENT_STATUS_CONFIG).map(([key, cfg]) => ({
  key,
  label: cfg.label,
}));

const FILTERS = [
  { key: 'all', label: 'All' },
  ...STATUS_OPTIONS,
] as const;

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

export default function ClientsAdminPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState<ClientRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*, partner:profiles!partner_id(full_name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load clients');
    } else {
      setClients((data || []) as unknown as ClientRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filtered = clients.filter((c) => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.client_name?.toLowerCase().includes(q) ||
      c.business_name?.toLowerCase().includes(q) ||
      c.partner?.full_name?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const updateLocalStatus = (id: string, status: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: status as Client['status'] } : c))
    );
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: status as Client['status'] } : prev));
  };

  const handleStatusChange = async (client: ClientRow, newStatus: string) => {
    setStatusUpdating(client.id);
    const { error } = await supabase
      .from('clients')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', client.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      updateLocalStatus(client.id, newStatus);
      const cfg = CLIENT_STATUS_CONFIG[newStatus];
      toast.success(`Status updated to "${cfg?.label || newStatus}"`);

      // Notify the partner
      if (client.partner_id) {
        await notifyUser(
          client.partner_id,
          'Client Status Updated',
          `The status of your client "${client.client_name}" has been updated to "${cfg?.label || newStatus}".`,
          'info',
          '/partner'
        );
      }
    }
    setStatusUpdating(null);
  };

  const openDetail = (client: ClientRow) => {
    setSelected(client);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const counts = FILTERS.reduce<Record<string, number>>((acc, f) => {
    acc[f.key] = f.key === 'all' ? clients.length : clients.filter((c) => c.status === f.key).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Users className="h-6 w-6 text-primary" />
            Clients
          </h2>
          <p className="text-muted-foreground">Manage all clients across partners.</p>
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? 'default' : 'outline'}
              onClick={() => setFilter(f.key)}
              className={cn(filter === f.key && 'bg-primary hover:bg-primary/90')}
            >
              {f.label}
              <Badge
                variant="secondary"
                className="ml-2 border-transparent bg-background/20 px-1.5 py-0 text-[10px]"
              >
                {counts[f.key]}
              </Badge>
            </Button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search client, business, partner…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-secondary p-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No clients found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {clients.length === 0
                ? 'Clients submitted by partners will appear here.'
                : 'No clients match your current filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Business</TableHead>
                  <TableHead className="hidden lg:table-cell">Partner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Budget</TableHead>
                  <TableHead className="hidden lg:table-cell">Update Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client) => {
                  const cfg = CLIENT_STATUS_CONFIG[client.status] || {
                    label: client.status,
                    color: 'text-stone-700',
                    bg: 'bg-stone-100 border-stone-200',
                  };
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="font-medium">{client.client_name}</div>
                        <div className="text-xs text-muted-foreground lg:hidden">{client.partner?.full_name || '—'}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {client.business_name || '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {client.partner?.full_name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('border-0 font-medium', cfg.bg, cfg.color)}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatCurrency(client.estimated_budget)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Select
                          value={client.status}
                          onValueChange={(v) => handleStatusChange(client, v)}
                          disabled={statusUpdating === client.id}
                        >
                          <SelectTrigger className="h-8 w-36 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.key} value={opt.key} className="text-xs">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatDate(client.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => openDetail(client)}
                            aria-label="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Details dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Client Details
            </DialogTitle>
            <DialogDescription>Added {formatDate(selected?.created_at)}</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {selected.client_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-semibold">{selected.client_name}</div>
                    <div className="text-sm text-muted-foreground">Partner: {selected.partner?.full_name || '—'}</div>
                  </div>
                </div>
                {(() => {
                  const cfg = CLIENT_STATUS_CONFIG[selected.status] || {
                    label: selected.status,
                    color: 'text-stone-700',
                    bg: 'bg-stone-100 border-stone-200',
                  };
                  return (
                    <Badge variant="outline" className={cn('border-0 font-medium', cfg.bg, cfg.color)}>
                      {cfg.label}
                    </Badge>
                  );
                })()}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField label="Business Name" value={selected.business_name} />
                <DetailField label="Partner" value={selected.partner?.full_name} />
                <DetailField label="Phone" value={selected.phone} />
                <DetailField label="WhatsApp" value={selected.whatsapp} />
                <DetailField label="Location" value={selected.location} />
                <DetailField label="Estimated Budget" value={formatCurrency(selected.estimated_budget)} />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Work / Services Needed</div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
                  {selected.services_needed || '—'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Project Description</div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
                  {selected.additional_notes || '—'}
                </div>
              </div>

              {/* Status updater in dialog */}
              <div className="space-y-2 border-t border-border/60 pt-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Update Status</div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <Select
                    value={selected.status}
                    onValueChange={(v) => handleStatusChange(selected, v)}
                    disabled={statusUpdating === selected.id}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.key} value={opt.key}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {statusUpdating === selected.id && (
                    <span className="text-xs text-muted-foreground">Updating…</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
