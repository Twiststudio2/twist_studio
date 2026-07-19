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

import { Palette, Search, Ban, Power, Briefcase } from 'lucide-react';

type CreativeRow = Profile;

const PROFILE_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  suspended: { label: 'Suspended', color: 'text-amber-700', bg: 'bg-amber-100' },
  deactivated: { label: 'Deactivated', color: 'text-stone-600', bg: 'bg-stone-200' },
};

export default function CreativesAdminPage() {
  const [creatives, setCreatives] = useState<CreativeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Assign job dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<CreativeRow | null>(null);
  const [assignForm, setAssignForm] = useState({
    title: '',
    description: '',
    deadline: '',
    payment: '',
  });
  const [assigning, setAssigning] = useState(false);

  const fetchCreatives = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'creative')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load creatives');
    } else {
      setCreatives(data as CreativeRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCreatives();
  }, [fetchCreatives]);

  const q = search.trim().toLowerCase();
  const filtered = creatives.filter(
    (c) => !q || c.full_name?.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  );

  const updateLocalStatus = (id: string, status: string) => {
    setCreatives((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: status as Profile['status'] } : c))
    );
  };

  const handleStatusChange = async (
    creative: CreativeRow,
    newStatus: 'suspended' | 'deactivated'
  ) => {
    setActionLoading(`${newStatus}-${creative.id}`);
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', creative.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      updateLocalStatus(creative.id, newStatus);
      const cfg = PROFILE_STATUS_CONFIG[newStatus];
      toast.success(`Creative ${cfg.label.toLowerCase()}`);
      await notifyUser(
        creative.id,
        'Account Status Updated',
        `Your Twist Studio account has been ${cfg.label.toLowerCase()}.`,
        'warning',
        '/creative'
      );
    }
    setActionLoading(null);
  };

  const openAssign = (creative: CreativeRow) => {
    setAssignTarget(creative);
    setAssignForm({ title: '', description: '', deadline: '', payment: '' });
    setAssignOpen(true);
  };

  const handleAssignJob = async () => {
    if (!assignTarget) return;
    if (!assignForm.title.trim()) {
      toast.error('Enter a job title');
      return;
    }
    const payment = assignForm.payment ? parseFloat(assignForm.payment) : null;
    if (assignForm.payment && (isNaN(payment as number) || (payment as number) < 0)) {
      toast.error('Enter a valid payment amount');
      return;
    }

    setAssigning(true);
    const { error } = await supabase.from('creative_jobs').insert({
      creative_id: assignTarget.id,
      title: assignForm.title.trim(),
      description: assignForm.description.trim() || null,
      deadline: assignForm.deadline || null,
      payment_amount: payment,
    });

    if (error) {
      toast.error('Failed to assign job');
    } else {
      toast.success('Job assigned');
      await notifyUser(
        assignTarget.id,
        'New Job Assigned',
        `You have been assigned a new job: "${assignForm.title.trim()}".`,
        'info',
        '/creative'
      );
      setAssignOpen(false);
    }
    setAssigning(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeCount = creatives.filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Palette className="h-6 w-6 text-primary" />
            Creatives
          </h2>
          <p className="text-muted-foreground">Manage creatives and assign jobs.</p>
        </div>
        <Badge variant="secondary" className="border-transparent bg-emerald-100 text-emerald-700">
          {activeCount} active
        </Badge>
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
              <Palette className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No creatives found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {creatives.length === 0
                ? 'Approved creatives will appear here.'
                : 'No creatives match your search.'}
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
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((creative) => {
                  const cfg = PROFILE_STATUS_CONFIG[creative.status] || {
                    label: creative.status,
                    color: 'text-stone-700',
                    bg: 'bg-stone-100',
                  };
                  return (
                    <TableRow key={creative.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {(creative.full_name || creative.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{creative.full_name || '—'}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{creative.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {creative.email}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {creative.phone || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('border-0 font-medium', cfg.bg, cfg.color)}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatDate(creative.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="Assign job"
                            onClick={() => openAssign(creative)}
                          >
                            <Briefcase className="h-4 w-4" />
                          </Button>
                          {creative.status === 'active' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                              title="Suspend"
                              onClick={() => handleStatusChange(creative, 'suspended')}
                              disabled={actionLoading === `suspended-${creative.id}`}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          {(creative.status === 'active' || creative.status === 'suspended') && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-stone-600 hover:bg-stone-100 hover:text-stone-700"
                              title="Deactivate"
                              onClick={() => handleStatusChange(creative, 'deactivated')}
                              disabled={actionLoading === `deactivated-${creative.id}`}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
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

      {/* Assign job dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Assign Job
            </DialogTitle>
            <DialogDescription>
              To {assignTarget?.full_name || assignTarget?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="job-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="job-title"
                value={assignForm.title}
                onChange={(e) => setAssignForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Logo design for Acme Co."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="job-desc">Description</Label>
              <Textarea
                id="job-desc"
                rows={4}
                value={assignForm.description}
                onChange={(e) => setAssignForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Job brief, requirements, deliverables…"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="job-deadline">Deadline</Label>
                <Input
                  id="job-deadline"
                  type="date"
                  value={assignForm.deadline}
                  onChange={(e) => setAssignForm((p) => ({ ...p, deadline: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="job-pay">Payment (GHS)</Label>
                <Input
                  id="job-pay"
                  type="number"
                  min={0}
                  step={0.01}
                  value={assignForm.payment}
                  onChange={(e) => setAssignForm((p) => ({ ...p, payment: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={assigning}>
              Cancel
            </Button>
            <Button onClick={handleAssignJob} disabled={assigning} className="bg-primary hover:bg-primary/90">
              {assigning ? 'Assigning…' : 'Assign Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
