'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, type MarketingMaterial } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Megaphone, Plus, Pencil, Trash2, Download, FileText } from 'lucide-react';
import { FileUpload } from '@/components/file-upload';

const CATEGORIES = [
  'Business Card',
  'T-shirt',
  'Company Profile',
  'Logo',
  'Price List',
  'Flyer',
] as const;

const CATEGORY_BADGE: Record<string, string> = {
  'Business Card': 'border-transparent bg-accent/20 text-accent-foreground',
  'T-shirt': 'border-transparent bg-violet-100 text-violet-700',
  'Company Profile': 'border-transparent bg-blue-100 text-blue-700',
  Logo: 'border-transparent bg-emerald-100 text-emerald-700',
  'Price List': 'border-transparent bg-cyan-100 text-cyan-700',
  Flyer: 'border-transparent bg-rose-100 text-rose-700',
};

type FormState = {
  name: string;
  category: string;
  file_url: string;
  file_format: string;
  description: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  category: '',
  file_url: '',
  file_format: '',
  description: '',
};

export default function MarketingAdminPage() {
  const [materials, setMaterials] = useState<MarketingMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MarketingMaterial | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<MarketingMaterial | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('marketing_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load marketing materials');
    } else {
      setMaterials((data as MarketingMaterial[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (material: MarketingMaterial) => {
    setEditing(material);
    setForm({
      name: material.name,
      category: material.category,
      file_url: material.file_url,
      file_format: material.file_format || '',
      description: material.description || '',
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Enter a name');
      return;
    }
    if (!form.category) {
      toast.error('Select a category');
      return;
    }
    if (!form.file_url.trim()) {
      toast.error('Enter a file URL');
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      file_url: form.file_url.trim(),
      file_format: form.file_format.trim() || null,
      description: form.description.trim() || null,
    };

    if (editing) {
      const { data, error } = await supabase
        .from('marketing_materials')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single();

      if (error) {
        toast.error('Failed to update material');
      } else {
        setMaterials((prev) =>
          prev.map((m) => (m.id === editing.id ? (data as MarketingMaterial) : m))
        );
        toast.success('Material updated');
        setFormOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from('marketing_materials')
        .insert({ ...payload, is_active: true, version: 1 })
        .select()
        .single();

      if (error) {
        toast.error('Failed to add material');
      } else {
        setMaterials((prev) => [data as MarketingMaterial, ...prev]);
        toast.success('Material added');
        setFormOpen(false);
      }
    }
    setSaving(false);
  };

  const openDelete = (material: MarketingMaterial) => {
    setDeleteTarget(material);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase
      .from('marketing_materials')
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      toast.error('Failed to delete material');
    } else {
      setMaterials((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      toast.success('Material deleted');
      setDeleteOpen(false);
      setDeleteTarget(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Megaphone className="h-6 w-6 text-primary" />
            Marketing Materials
          </h2>
          <p className="text-muted-foreground">Manage downloadable brand and marketing assets.</p>
        </div>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add Material
        </Button>
      </div>

      {/* Grid or empty state */}
      {materials.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-secondary p-4">
              <Megaphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No materials yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add your first marketing material to make it available for download.
            </p>
            <Button onClick={openAdd} className="mt-4 bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Add Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <Card key={material.id} className="group border-border/60 transition hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      title="Edit"
                      onClick={() => openEdit(material)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      title="Delete"
                      onClick={() => openDelete(material)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="mt-4 font-semibold leading-tight">{material.name}</h3>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'border-0 font-medium',
                      CATEGORY_BADGE[material.category] || 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    {material.category}
                  </Badge>
                  {material.file_format && (
                    <Badge variant="secondary" className="border-transparent uppercase">
                      {material.file_format}
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-border/60 font-normal text-muted-foreground">
                    v{material.version}
                  </Badge>
                </div>

                {material.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {material.description}
                  </p>
                )}

                <div className="mt-4 border-t border-border/60 pt-3">
                  <Button asChild variant="outline" className="w-full">
                    <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              {editing ? 'Edit Material' : 'Add Material'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the details of this marketing material.'
                : 'Create a new downloadable marketing material.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="mat-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mat-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Twist Studio Business Card"
              />
            </div>

            <div className="grid gap-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category…" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>
                File <span className="text-destructive">*</span>
              </Label>
              <FileUpload
                value={form.file_url}
                onChange={(url) => setForm((p) => ({ ...p, file_url: url }))}
                folder="marketing"
                maxSizeMb={50}
                kind="file"
                label="Upload File"
              />
              <Input
                value={form.file_url}
                onChange={(e) => setForm((p) => ({ ...p, file_url: e.target.value }))}
                placeholder="…or paste a file URL"
                className="text-xs"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mat-format">File Format</Label>
              <Input
                id="mat-format"
                value={form.file_format}
                onChange={(e) => setForm((p) => ({ ...p, file_format: e.target.value }))}
                placeholder="e.g. PDF, PNG, AI"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mat-desc">Description</Label>
              <Textarea
                id="mat-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short description of the material…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Material'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span>? This action
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
