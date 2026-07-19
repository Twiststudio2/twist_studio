'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, type PortfolioItem } from '@/lib/supabase';
import { PORTFOLIO_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
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

import { Plus, Pencil, Trash2, Image as ImageIcon, Star } from 'lucide-react';
import { FileUpload } from '@/components/file-upload';

type FormData = {
  title: string;
  description: string;
  category: string;
  image_url: string;
  video_url: string;
  tags: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: string;
};

const EMPTY_FORM: FormData = {
  title: '',
  description: '',
  category: PORTFOLIO_CATEGORIES[0],
  image_url: '',
  video_url: '',
  tags: '',
  is_featured: false,
  is_active: true,
  sort_order: '0',
};

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export default function PortfolioAdminPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load portfolio items');
    } else {
      setItems(data as PortfolioItem[]);
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

  const openEdit = (item: PortfolioItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description ?? '',
      category: item.category,
      image_url: item.image_url ?? '',
      video_url: item.video_url ?? '',
      tags: (item.tags ?? []).join(', '),
      is_featured: item.is_featured,
      is_active: item.is_active,
      sort_order: String(item.sort_order ?? 0),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      image_url: form.image_url.trim() || null,
      video_url: form.video_url.trim() || null,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      is_featured: form.is_featured,
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order, 10) || 0,
    };

    if (editing) {
      const { error } = await supabase
        .from('portfolio_items')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editing.id);

      if (error) {
        toast.error('Failed to update item');
      } else {
        toast.success('Portfolio item updated');
        setDialogOpen(false);
        fetchItems();
      }
    } else {
      const { error } = await supabase.from('portfolio_items').insert(payload);

      if (error) {
        toast.error('Failed to create item');
      } else {
        toast.success('Portfolio item created');
        setDialogOpen(false);
        fetchItems();
      }
    }

    setSaving(false);
  };

  const openDelete = (item: PortfolioItem) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      toast.error('Failed to delete item');
    } else {
      toast.success('Item deleted');
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

  const featuredCount = items.filter((i) => i.is_featured).length;
  const activeCount = items.filter((i) => i.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Management</h2>
          <p className="text-muted-foreground">
            Add, edit, and organize the work you showcase to the world.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? 'Update the details of this portfolio piece.'
                  : 'Fill in the details to add a new piece of work to your portfolio.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="pf-title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pf-title"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="e.g. Nsuomnam Brand Identity"
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="pf-desc">Description</Label>
                <Textarea
                  id="pf-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="A short description of the project and your role."
                />
              </div>

              {/* Category + Sort order */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="pf-category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="pf-category"
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    className={selectClass}
                  >
                    {PORTFOLIO_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pf-order">Sort Order</Label>
                  <Input
                    id="pf-order"
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

              {/* Image + Video uploads */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Image</Label>
                  <FileUpload
                    value={form.image_url}
                    onChange={(url) => setField('image_url', url)}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    maxSizeMb={10}
                    folder="portfolio"
                    kind="image"
                    label="Upload Image"
                  />
                  <Input
                    value={form.image_url}
                    onChange={(e) => setField('image_url', e.target.value)}
                    placeholder="…or paste an image URL"
                    className="text-xs"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Video</Label>
                  <FileUpload
                    value={form.video_url}
                    onChange={(url) => setField('video_url', url)}
                    accept="video/mp4,video/webm,video/quicktime"
                    maxSizeMb={100}
                    folder="portfolio"
                    kind="video"
                    label="Upload Video"
                  />
                  <Input
                    value={form.video_url}
                    onChange={(e) => setField('video_url', e.target.value)}
                    placeholder="…or paste a video URL (optional)"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="grid gap-2">
                <Label htmlFor="pf-tags">Tags</Label>
                <Input
                  id="pf-tags"
                  value={form.tags}
                  onChange={(e) => setField('tags', e.target.value)}
                  placeholder="logo, packaging, rebrand"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated keywords for search and filtering.
                </p>
              </div>

              {/* Toggles */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                  <div className="pr-3">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Star className="h-3.5 w-3.5 text-accent" />
                      Featured
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Highlight on the homepage.
                    </p>
                  </div>
                  <Switch
                    checked={form.is_featured}
                    onCheckedChange={(v) => setField('is_featured', v)}
                  />
                </div>
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
                    : 'Create Item'}
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
          <Star className="h-3 w-3 fill-accent text-accent" />
          {featuredCount} featured
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {activeCount} active
        </Badge>
      </div>

      {/* Grid or empty state */}
      {items.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-secondary p-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No portfolio items yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Get started by adding your first piece of work. It will appear in
              the grid below once created.
            </p>
            <Button
              onClick={() => {
                openAdd();
                setDialogOpen(true);
              }}
              className="mt-5 bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {/* Media */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {item.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary/40">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}

                {item.is_featured && (
                  <div className="absolute left-3 top-3">
                    <Badge className="gap-1 border-transparent bg-accent text-accent-foreground shadow-sm hover:bg-accent/90">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </Badge>
                  </div>
                )}

                <div className="absolute right-3 top-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      'border-0 bg-background/90 shadow-sm backdrop-blur',
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
              </div>

              {/* Body */}
              <CardContent className="space-y-3 p-4">
                <div className="space-y-1.5">
                  <h3 className="truncate font-semibold leading-tight">
                    {item.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary"
                  >
                    {item.category}
                  </Badge>
                </div>

                {item.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 4).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="font-normal text-muted-foreground"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 4 && (
                      <Badge
                        variant="secondary"
                        className="font-normal text-muted-foreground"
                      >
                        +{item.tags.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-xs text-muted-foreground">
                    Order&nbsp;{item.sort_order ?? 0}
                    {item.video_url && (
                      <span className="ml-2 text-primary/70">has video</span>
                    )}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openEdit(item)}
                      aria-label={`Edit ${item.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => openDelete(item)}
                      aria-label={`Delete ${item.title}`}
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
            <DialogTitle>Delete Portfolio Item</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to delete "${deleteTarget?.title ?? ''}"? This action cannot be undone.`}
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
