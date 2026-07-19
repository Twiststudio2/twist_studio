'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, type CreativeApplication } from '@/lib/supabase';
import { APP_STATUS_CONFIG, CREATIVE_SKILLS } from '@/lib/constants';
import { notifyUser, formatDate } from '@/lib/data';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Check, X, Ban, Trash2, Eye, Palette, Filter } from 'lucide-react';

type ApplicationRow = CreativeApplication & {
  profile?: { email: string; full_name: string | null; role: string } | null;
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'suspended', label: 'Suspended' },
] as const;

const SKILL_COLORS: Record<string, string> = {};
CREATIVE_SKILLS.forEach((s, i) => {
  SKILL_COLORS[s] = ['text-primary', 'text-accent', 'text-blue-600', 'text-violet-600'][i % 4];
});

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

export default function CreativeApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState<ApplicationRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ApplicationRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('creative_applications')
      .select('*, profile:profiles!user_id(email, full_name, role)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load creative applications');
    } else {
      setApplications((data || []) as unknown as ApplicationRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filtered = applications.filter((app) => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      app.full_name?.toLowerCase().includes(q) ||
      app.profile?.email?.toLowerCase().includes(q) ||
      app.phone?.toLowerCase().includes(q) ||
      app.skills?.some((s) => s.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const updateLocalStatus = (id: string, status: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: status as CreativeApplication['status'] } : a))
    );
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: status as CreativeApplication['status'] } : prev));
  };

  const removeLocal = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const handleApprove = async (app: ApplicationRow) => {
    setActionLoading(`approve-${app.id}`);
    const { error: appError } = await supabase
      .from('creative_applications')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', app.id);

    if (appError) {
      toast.error('Failed to approve application');
      setActionLoading(null);
      return;
    }

    // Update profile role to creative if not already
    if (app.profile && app.profile.role !== 'creative') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'creative', updated_at: new Date().toISOString() })
        .eq('id', app.user_id);

      if (profileError) {
        toast.error('Application approved, but failed to update user role');
      }
    }

    await notifyUser(
      app.user_id,
      'Application Approved 🎉',
      'Congratulations! Your creative application has been approved. You can now access your creative dashboard.',
      'success',
      '/creative'
    );

    updateLocalStatus(app.id, 'approved');
    toast.success('Application approved');
    setActionLoading(null);
  };

  const handleReject = async (app: ApplicationRow) => {
    setActionLoading(`reject-${app.id}`);
    const { error } = await supabase
      .from('creative_applications')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', app.id);

    if (error) {
      toast.error('Failed to reject application');
    } else {
      await notifyUser(
        app.user_id,
        'Application Update',
        'Your creative application was not approved at this time. You may reapply in the future.',
        'warning'
      );
      updateLocalStatus(app.id, 'rejected');
      toast.success('Application rejected');
    }
    setActionLoading(null);
  };

  const handleSuspend = async (app: ApplicationRow) => {
    setActionLoading(`suspend-${app.id}`);
    const { error } = await supabase
      .from('creative_applications')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('id', app.id);

    if (error) {
      toast.error('Failed to suspend application');
    } else {
      await notifyUser(
        app.user_id,
        'Account Suspended',
        'Your creative account has been suspended. Please contact support for more information.',
        'error'
      );
      updateLocalStatus(app.id, 'suspended');
      toast.success('Application suspended');
    }
    setActionLoading(null);
  };

  const openDelete = (app: ApplicationRow) => {
    setDeleteTarget(app);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('creative_applications').delete().eq('id', deleteTarget.id);

    if (error) {
      toast.error('Failed to delete application');
    } else {
      removeLocal(deleteTarget.id);
      toast.success('Application deleted');
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  const openDetail = (app: ApplicationRow) => {
    setSelected(app);
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
    acc[f.key] = f.key === 'all' ? applications.length : applications.filter((a) => a.status === f.key).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Palette className="h-6 w-6 text-primary" />
            Creative Applications
          </h2>
          <p className="text-muted-foreground">Review and manage creative talent applications.</p>
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
        <Input
          placeholder="Search name, email, skill…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-64"
        />
      </div>

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-secondary p-4">
              <Palette className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No applications found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {applications.length === 0
                ? 'Creative applications will appear here once submitted.'
                : 'No applications match your current filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead className="hidden lg:table-cell">Skills</TableHead>
                  <TableHead className="hidden md:table-cell">Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((app) => {
                  const cfg = APP_STATUS_CONFIG[app.status] || {
                    label: app.status,
                    color: 'text-stone-700',
                    bg: 'bg-stone-100 border-stone-200',
                  };
                  return (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="font-medium">{app.full_name}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{app.profile?.email}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {app.skills && app.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {app.skills.slice(0, 2).map((s) => (
                              <Badge key={s} variant="secondary" className="font-normal text-xs">
                                {s}
                              </Badge>
                            ))}
                            {app.skills.length > 2 && (
                              <Badge variant="secondary" className="font-normal text-xs">
                                +{app.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {app.years_experience} yr{app.years_experience === 1 ? '' : 's'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('border-0 font-medium', cfg.bg, cfg.color)}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatDate(app.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => openDetail(app)}
                            aria-label="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {app.status !== 'approved' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => handleApprove(app)}
                              disabled={actionLoading === `approve-${app.id}`}
                              aria-label="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {app.status !== 'rejected' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              onClick={() => handleReject(app)}
                              disabled={actionLoading === `reject-${app.id}`}
                              aria-label="Reject"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          {app.status !== 'suspended' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                              onClick={() => handleSuspend(app)}
                              disabled={actionLoading === `suspend-${app.id}`}
                              aria-label="Suspend"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => openDelete(app)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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
              <Palette className="h-5 w-5 text-primary" />
              Creative Application
            </DialogTitle>
            <DialogDescription>Submitted {formatDate(selected?.created_at)}</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                    {selected.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-semibold">{selected.full_name}</div>
                    <div className="text-sm text-muted-foreground">{selected.profile?.email}</div>
                  </div>
                </div>
                {(() => {
                  const cfg = APP_STATUS_CONFIG[selected.status] || {
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
                <DetailField label="Email" value={selected.profile?.email} />
                <DetailField label="Phone" value={selected.phone} />
                <DetailField label="WhatsApp" value={selected.whatsapp} />
                <DetailField label="Country" value={selected.country} />
                <DetailField label="Region" value={selected.region} />
                <DetailField label="City" value={selected.city} />
                <DetailField label="Years of Experience" value={`${selected.years_experience} year${selected.years_experience === 1 ? '' : 's'}`} />
                <DetailField label="Date of Birth" value={formatDate(selected.date_of_birth)} />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {selected.skills && selected.skills.length > 0 ? (
                    selected.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className={cn('font-medium', SKILL_COLORS[skill] || 'text-primary')}
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </div>

              {/* Portfolio */}
              {selected.portfolio_link && (
                <div className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Portfolio Link</div>
                  <a
                    href={selected.portfolio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    {selected.portfolio_link}
                  </a>
                </div>
              )}

              {/* Why hire */}
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Why Hire Me</div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
                  {selected.why_hire || '—'}
                </div>
              </div>

              {/* Sample works */}
              {selected.sample_works_urls && selected.sample_works_urls.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sample Works</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.sample_works_urls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Sample {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {selected && selected.status !== 'approved' && (
              <Button
                onClick={() => handleApprove(selected)}
                disabled={actionLoading === `approve-${selected.id}`}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Check className="mr-2 h-4 w-4" /> Approve
              </Button>
            )}
            {selected && selected.status !== 'rejected' && (
              <Button
                variant="outline"
                onClick={() => handleReject(selected)}
                disabled={actionLoading === `reject-${selected.id}`}
                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
            )}
            {selected && selected.status !== 'suspended' && (
              <Button
                variant="outline"
                onClick={() => handleSuspend(selected)}
                disabled={actionLoading === `suspend-${selected.id}`}
                className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              >
                <Ban className="mr-2 h-4 w-4" /> Suspend
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the application from{' '}
              <span className="font-medium text-foreground">{deleteTarget?.full_name}</span>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
