'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Upload, Loader as Loader2, X, FileText, Image as ImageIcon, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  accept?: string;
  maxSizeMb?: number;
  label?: string;
  kind?: 'image' | 'video' | 'file';
  className?: string;
};

export function FileUpload({
  value,
  onChange,
  bucket = 'media-assets',
  folder = 'uploads',
  accept,
  maxSizeMb = 10,
  label = 'Upload file',
  kind = 'file',
  className,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`File must be under ${maxSizeMb}MB`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: true });

    if (upErr) {
      toast.error(upErr.message);
      setUploading(false);
      e.target.value = '';
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(urlData.publicUrl);
    setUploading(false);
    e.target.value = '';
    toast.success('Upload complete');
  };

  const clear = () => onChange('');

  const Icon = kind === 'image' ? ImageIcon : kind === 'video' ? Film : FileText;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Uploading...' : label}
        </button>

        {value && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 text-sm text-rose-600 hover:underline"
          >
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {value && (
        <div className="overflow-hidden rounded-lg border border-border/60 bg-muted">
          {kind === 'image' ? (
            <div className="relative aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
            </div>
          ) : kind === 'video' ? (
            <video src={value} controls className="aspect-video w-full bg-black" />
          ) : (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-4 text-sm text-primary hover:underline"
            >
              <Icon className="h-5 w-5" /> View uploaded file
            </a>
          )}
        </div>
      )}
    </div>
  );
}
