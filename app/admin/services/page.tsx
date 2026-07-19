'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, type Service } from '@/lib/supabase';
import { SERVICES_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/data';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Plus, Pencil, Trash2, Wrench, DollarSign } from 'lucide-react';

type FormData = {
  name: string;
  description: string;
  category: string;
  price_from: string;
  price_to: string;
  price_label: string;
  features: string;
  is_active: boolean;
  sort_order: string;
};

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  category: SERVICES_CATEGORIES[0],
  price_from: '',
  price_to: '',
  price_label: '',
  features: '',
  is_active: true,
  sort_order: '0',
};

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export default function ServicesAdminPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load services');
    } else {
      setItems(data as Service[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sort_order: String(items.length) });
  };

  const openEdit = (item: Service) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? '',
      category: item.category ?? SERVICES_CATEGORIES[0],
      price_from: item.price_from != null ? String(item.price_from) : '',
      price_to: item.price_to != null ? String(item.price_to) : '',
      price_label: item.price_label ?? '',
      features: (item.features ?? []).join(', '),
      is_active: item.is_active,
      sort_order: String(item.sort_order ?? 0),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Service name is required');
      return;
    }
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }

    const fromVal = form.price_from.trim();
    const toVal = form.price_to.trim();
    const fromNum = fromVal ? Number(fromVal) : null;
    const toNum = toVal ? Number(toVal) : null;

    if ((fromVal && fromNum == null) || (toVal && toNum == null) || Number.isNaN(fromNum) || Number.isNaN(toNum)) {
      toast.error('Prices must be valid numbers');
      return;
    }
    if (fromNum != null && toNum != null && toNum < fromNum) {
      toast.error('Price "to" cannot be lower than price "from"');
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category,
      price_from: fromNum,
      price_to: toNum,
      price_label: form.price_label.trim() || null,
      features: form.features
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order, 10) || 0,
    };

    if (editing) {
      const { error } = await supabase.from('services').update(payload).eq('id', editing.id);

      if (error) {
        toast.error('Failed to update service');
      } else {
        toast.success('Service updated');
        setDialogOpen(false);
        fetchItems();
      }
    } else {
      const { error } = await supabase.from('services').insert(payload);

      if (error) {
        toast.error('Failed to create service');
      } else {
        toast.success('Service created');
        setDialogOpen(false);
        fetchItems();
      }
    }

    setSaving(false);
  };

  const openDelete = (item: Service) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    const { error } = await supabase.from('services').delete().eq('id', deleteTarget.id);

    if (error) {
      toast.error('Failed to delete service');
    } else {
      toast.success('Service deleted');
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchItems();
    }

    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeCount = items.filter((i) => i.is_active).length;
  const categoryCount = new Set(items.map((i) => i.category).filter(Boolean)).size;

  /** Build a readable price string for a service card. */
  const priceDisplay = (item: Service) => {
    if (item.price_label?.trim()) return item.price_label.trim();
    const from = item.price_from;
    const to = item.price_to;
    if (from != null && to != null) {
      return `${formatCurrency(from)} – ${formatCurrency(to)}`;
    }
    if (from != null) {
      return `From ${formatCurrency(from)}`;
    }
    if (to != null) {
      return `Up to ${formatCurrency(to)}`;
    }
    return 'Price on request';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Services Management</h2>
          <p className="text-muted-foreground">
            Add, edit, and organize the services you offer to clients.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit Service' : 'Add Service'}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? 'Update the details of this service.'
                  : 'Fill in the details to add a new service to your catalogue.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="svc-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="svc-name"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Logo Design"
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="svc-desc">Description</Label>
                <Textarea
                  id="svc-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="A short description of what this service includes."
                />
              </div>

              {/* Category + Sort order */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="svc-category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="svc-category"
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    className={selectClass}
                  >
                    {SERVICES_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="svc-order">Sort Order</Label>
                  <Input
                    id="svc-order"
                    type="number"
                    min={0}
                    value={form.sort_order}
                    onChange={(e) => setField('sort_order', e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first.
                  </p>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="svc-from">Price From (GHS)</Label>
                  <Input
                    id="svc-from"
                    type="number"
                    min={0}
                    value={form.price_from}
                    onChange={(e) => setField('price_from', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="svc-to">Price To (GHS)</Label>
                  <Input
                    id="svc-to"
                    type="number"
                    min={0}
                    value={form.price_to}
                    onChange={(e) => setField('price_to', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="svc-label">Price Label</Label>
                  <Input
                    id="svc-label"
                    value={form.price_label}
                    onChange={(e) => setField('price_label', e.target.value)}
                    placeholder="e.g. Per project"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                If a price label is set it is shown instead of the numeric range.
                Leave all three blank to display &ldquo;Price on request&rdquo;.
              </p>

              {/* Features */}
              <div className="grid gap-2">
                <Label htmlFor="svc-features">Features</Label>
                <Input
                  id="svc-features"
                  value={form.features}
                  onChange={(e) => setField('features', e.target.value)}
                  placeholder="3 concepts, unlimited revisions, source files"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of what&rsquo;s included in the service.
                </p>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div className="pr-3">
                  <div className="text-sm font-medium">Active</div>
                  <p className="text-xs text-muted-foreground">
                    Visible on the public site.
                  </p>
                </div>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setField('is_active', v)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                {saving
                  ? 'Saving...'
                  : editing
                    ? 'Save Changes'
                    : 'Create Service'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {items.length} total
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {activeCount} active
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <Wrench className="h-3 w-3" />
          {categoryCount} categories
        </Badge>
      </div>

      {/* Grid or empty state */}
      {items.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-secondary p-4">
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No services yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Get started by adding your first service. It will appear in the
              grid below once created.
            </p>
            <Button
              onClick={() => {
                openAdd();
                setDialogOpen(true);
              }}
              className="mt-5 bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className={cn(
                'group flex flex-col border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-lg',
                !item.is_active && 'opacity-75'
              )}
            >
              <CardContent className="flex flex-1 flex-col space-y-3 p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <h3 className="font-semibold leading-tight">
                      {item.name}
                    </h3>
                    {item.category && (
                      <Badge
                        variant="outline"
                        className="border-primary/30 text-primary"
                      >
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 border-0',
                      item.is_active
                        ? 'text-emerald-700'
                        : 'text-muted-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'mr-1.5 h-1.5 w-1.5 rounded-full',
                        item.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'
                      )}
                    />
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                  <DollarSign className="h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm font-semibold">
                    {priceDisplay(item)}
                  </span>
                </div>

                {/* Features */}
                {item.features && item.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.features.slice(0, 5).map((feat) => (
                      <Badge
                        key={feat}
                        variant="secondary"
                        className="font-normal text-muted-foreground"
                      >
                        {feat}
                      </Badge>
                    ))}
                    {item.features.length > 5 && (
                      <Badge
                        variant="secondary"
                        className="font-normal text-muted-foreground"
                      >
                        +{item.features.length - 5}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Spacer pushes footer to bottom */}
                <div className="flex-1" />

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-xs text-muted-foreground">
                    Order&nbsp;{item.sort_order ?? 0}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openEdit(item)}
                      aria-label={`Edit ${item.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => openDelete(item)}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to delete "${deleteTarget?.name ?? ''}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
