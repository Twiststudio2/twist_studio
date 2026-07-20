'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import { formatDate, notifyUser } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
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

import { Users, Search, Ban, Power, CircleCheck as CheckCircle2, Mail, Eye } from 'lucide-react';

type PartnerRow = Profile & { client_count: number };

const PROFILE_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  suspended: { label: 'Suspended', color: 'text-amber-700', bg: 'bg-amber-100' },
  deactivated: { label: 'Deactivated', color: 'text-stone-600', bg: 'bg-stone-200' },
};

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

export default function PartnersAdminPage() {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [selected, setSelected] = useState<PartnerRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<PartnerRow | null>(null);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sending, setSending] = useState(false);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'partner')
        .order('created_at', { ascending: false }),
      supabase.from('clients').select('partner_id'),
    ]);

    if (pRes.error) {
      toast.error('Failed to load partners');
    } else {
      const countMap: Record<string, number> = {};
      (cRes.data || []).forEach((c: { partner_id: string | null }) => {
        if (c.partner_id) countMap[c.partner_id] = (countMap[c.partner_id] || 0) + 1;
      });
      setPartners(
        (pRes.data as Profile[]).map((p) => ({ ...p, client_count: countMap[p.id] || 0 }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const q = search.trim().toLowerCase();
  const filtered = partners.filter(
    (p) => !q || p.full_name?.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
  );

  const updateLocalStatus = (id: string, status: string) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: status as Profile['status'] } : p))
    );
    setSelected((prev) =>
      prev && prev.id === id ? { ...prev, status: status as Profile['status'] } : prev
    );
  };

  const handleStatusChange = async (
    partner: PartnerRow,
    newStatus: 'active' | 'suspended' | 'deactivated'
  ) => {
    setActionLoading(`${newStatus}-${partner.id}`);
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', partner.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      updateLocalStatus(partner.id, newStatus);
      const cfg = PROFILE_STATUS_CONFIG[newStatus];
      toast.success(`Partner ${cfg.label.toLowerCase()}`);
      await notifyUser(
        partner.id,
        'Account Status Updated',
        `Your Twist Studio account has been ${cfg.label.toLowerCase()}.`,
        newStatus === 'active' ? 'success' : 'warning',
        '/partner'
      );
    }
    setActionLoading(null);
  };

  const openDetail = (partner: PartnerRow) => {
    setSelected(partner);
    setDetailOpen(true);
  };

  const openMessage = (partner: PartnerRow) => {
    setMessageTarget(partner);
    setMessageTitle('');
    setMessageBody('');
    setMessageOpen(true);
  };

  const handleSendMessage = async () => {
    if (!messageTarget) return;
    if (!messageBody.trim()) {
      toast.error('Please enter a message');
      return;
    }
    setSending(true);
    const { error } = await supabase.from('notifications').insert({
      user_id: messageTarget.id,
      title: messageTitle.trim() || 'Message from Twist Studio Admin',
      message: messageBody.trim(),
      type: 'info',
    });

    if (error) {
      toast.error('Failed to send message');
    } else {
      toast.success(`Message sent to ${messageTarget.full_name || messageTarget.email}`);
      setMessageOpen(false);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeCount = partners.filter((p) => p.status === 'active').length;
  const suspendedCount = partners.filter((p) => p.status === 'suspended').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Users className="h-6 w-6 text-primary" />
            Partners
          </h2>
          <p className="text-muted-foreground">Manage partners, their status and clients.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary" className="border-transparent bg-emerald-100 text-emerald-700">
            {activeCount} active
          </Badge>
          <Badge variant="secondary" className="border-transparent bg-amber-100 text-amber-700">
            {suspendedCount} suspended
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-secondary p-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No partners found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {partners.length === 0
                ? 'Approved partners will appear here.'
                : 'No partners match your search.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Clients</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((partner) => {
                  const cfg = PROFILE_STATUS_CONFIG[partner.status] || {
                    label: partner.status,
                    color: 'text-stone-700',
                    bg: 'bg-stone-100',
                  };
                  return (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {(partner.full_name || partner.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{partner.full_name || '—'}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{partner.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {partner.email}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {partner.phone || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('border-0 font-medium', cfg.bg, cfg.color)}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className="border-transparent">
                          {partner.client_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatDate(partner.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {partner.status === 'active' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                              title="Suspend"
                              onClick={() => handleStatusChange(partner, 'suspended')}
                              disabled={actionLoading === `suspended-${partner.id}`}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          {(partner.status === 'active' || partner.status === 'suspended') && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-stone-600 hover:bg-stone-100 hover:text-stone-700"
                              title="Deactivate"
                              onClick={() => handleStatusChange(partner, 'deactivated')}
                              disabled={actionLoading === `deactivated-${partner.id}`}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          )}
                          {(partner.status === 'suspended' || partner.status === 'deactivated') && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              title="Reactivate"
                              onClick={() => handleStatusChange(partner, 'active')}
                              disabled={actionLoading === `active-${partner.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="Send message"
                            onClick={() => openMessage(partner)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="View details"
                            onClick={() => openDetail(partner)}
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
              Partner Details
            </DialogTitle>
            <DialogDescription>Joined {formatDate(selected?.created_at)}</DialogDescription>
          </DialogHeader>

          {selected &&
            (() => {
              const cfg = PROFILE_STATUS_CONFIG[selected.status] || {
                label: selected.status,
                color: 'text-stone-700',
                bg: 'bg-stone-100',
              };
              return (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                        {(selected.full_name || selected.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{selected.full_name || '—'}</div>
                        <div className="text-sm text-muted-foreground">{selected.email}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('border-0 font-medium', cfg.bg, cfg.color)}>
                      {cfg.label}
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailField label="Email" value={selected.email} />
                    <DetailField label="Phone" value={selected.phone} />
                    <DetailField label="Status" value={selected.status} />
                    <DetailField label="Clients Referred" value={selected.client_count} />
                    <DetailField label="Joined" value={formatDate(selected.created_at)} />
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
                    {selected.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-600"
                        onClick={() => handleStatusChange(selected, 'suspended')}
                        disabled={!!actionLoading && actionLoading.endsWith(selected.id)}
                      >
                        <Ban className="mr-2 h-4 w-4" /> Suspend
                      </Button>
                    )}
                    {(selected.status === 'active' || selected.status === 'suspended') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(selected, 'deactivated')}
                        disabled={!!actionLoading && actionLoading.endsWith(selected.id)}
                      >
                        <Power className="mr-2 h-4 w-4" /> Deactivate
                      </Button>
                    )}
                    {(selected.status === 'suspended' || selected.status === 'deactivated') && (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => handleStatusChange(selected, 'active')}
                        disabled={!!actionLoading && actionLoading.endsWith(selected.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Reactivate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDetailOpen(false);
                        openMessage(selected);
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" /> Send Message
                    </Button>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* Message dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Send Message
            </DialogTitle>
            <DialogDescription>To {messageTarget?.full_name || messageTarget?.email}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="msg-title">Title</Label>
              <Input
                id="msg-title"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="Message from Twist Studio Admin"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="msg-body">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="msg-body"
                rows={5}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your message…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={sending} className="bg-primary hover:bg-primary/90">
              {sending ? 'Sending…' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
