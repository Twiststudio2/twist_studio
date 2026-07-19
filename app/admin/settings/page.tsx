'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Globe, Mail, Phone, Share2, Image as ImageIcon, Upload, Loader as Loader2, Palette, Eye } from 'lucide-react';

function readableFor(hex: string): string {
  const m = hex.replace('#', '');
  if (m.length !== 6) return '#fff';
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l > 0.55 ? '#1a2e29' : '#fcfcf7';
}
import { SITE } from '@/lib/constants';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [themeColors, setThemeColors] = useState({ theme_primary: '#0d6650', theme_accent: '#f0a500' });
  const [form, setForm] = useState({
    agency_name: SITE.name, tagline: SITE.tagline, mission: 'Provide world-class creative solutions while creating opportunities for talented creatives and marketers.',
    vision: 'Become Africa\'s leading creative agency.', email: SITE.email, phone: SITE.phone,
    whatsapp: SITE.whatsapp, address: SITE.address, instagram: SITE.social.instagram,
    twitter: SITE.social.twitter, facebook: SITE.social.facebook, linkedin: SITE.social.linkedin,
  });

  useEffect(() => {
    supabase.from('settings').select('logo_url').eq('id', 1).single().then(({ data }) => {
      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      }
    });

    supabase.from('site_settings').select('*').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.key] = s.value || ''; });
        setSettings(map);
        setForm((f) => ({ ...f, ...map }));
        if (map.logo_url) setLogoUrl(map.logo_url);
        if (map.theme_primary) setThemeColors((t) => ({ ...t, theme_primary: map.theme_primary }));
        if (map.theme_accent) setThemeColors((t) => ({ ...t, theme_accent: map.theme_accent }));
      }
    });
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('site-assets').upload(path, file, { cacheControl: '31536000', upsert: true });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const urlData = supabase.storage.from('site-assets').getPublicUrl(path);
    if (!urlData?.data?.publicUrl) {
      toast.error('Unable to get public logo URL');
      setUploading(false);
      return;
    }
    const publicUrl = urlData.data.publicUrl;
    const { error: dbErr } = await supabase.from('settings').update({ logo_url: publicUrl }).eq('id', 1);
    if (dbErr) {
      toast.error(dbErr.message);
      setUploading(false);
      return;
    }
    setLogoUrl(publicUrl);
    setUploading(false);
    toast.success('Logo uploaded successfully');
  };

  const removeLogo = async () => {
    await supabase.from('settings').update({ logo_url: '' }).eq('id', 1);
    setLogoUrl('');
    toast.success('Logo removed');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    for (const [key, value] of Object.entries(form)) {
      await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
    await supabase.from('site_settings').upsert({ key: 'theme_primary', value: themeColors.theme_primary, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    await supabase.from('site_settings').upsert({ key: 'theme_accent', value: themeColors.theme_accent, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setLoading(false);
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Website Settings</h2>
        <p className="text-muted-foreground">Manage your agency information and settings.</p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Logo</CardTitle>
          <CardDescription>Upload your agency logo. It will appear in the navbar and across the site. PNG or JPG, max 2MB.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/30">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
              )}
            </div>
            <div className="space-y-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Upload Logo'}
                <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
              </label>
              {logoUrl && (
                <button type="button" onClick={removeLogo} className="ml-2 text-sm text-rose-600 hover:underline">Remove</button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Theme &amp; Colors</CardTitle>
            <CardDescription>Customize the look of your website. Changes apply instantly on the public site after saving.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={themeColors.theme_primary}
                    onChange={(e) => setThemeColors((t) => ({ ...t, theme_primary: e.target.value }))}
                    className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
                  />
                  <Input
                    value={themeColors.theme_primary}
                    onChange={(e) => setThemeColors((t) => ({ ...t, theme_primary: e.target.value }))}
                    placeholder="#0d6650"
                    className="max-w-[160px]"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Used for buttons, links, and key accents across the site.</p>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={themeColors.theme_accent}
                    onChange={(e) => setThemeColors((t) => ({ ...t, theme_accent: e.target.value }))}
                    className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
                  />
                  <Input
                    value={themeColors.theme_accent}
                    onChange={(e) => setThemeColors((t) => ({ ...t, theme_accent: e.target.value }))}
                    placeholder="#f0a500"
                    className="max-w-[160px]"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Secondary highlight color used on badges and highlights.</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground"><Eye className="h-4 w-4" /> Live Preview</div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" style={{ backgroundColor: themeColors.theme_primary, color: readableFor(themeColors.theme_primary) }} className="rounded-md px-4 py-2 text-sm font-medium">Primary Button</button>
                <span style={{ backgroundColor: themeColors.theme_accent, color: readableFor(themeColors.theme_accent) }} className="rounded-md px-3 py-1.5 text-sm font-medium">Accent Badge</span>
                <span style={{ color: themeColors.theme_primary }} className="text-sm">Primary link</span>
                <span style={{ color: themeColors.theme_primary, borderColor: `${themeColors.theme_primary}4d`, backgroundColor: `${themeColors.theme_primary}1a` }} className="rounded-md border px-3 py-1.5 text-sm">Primary outline</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /> Agency Information</CardTitle>
            <CardDescription>Basic information about your agency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Agency Name</Label>
                <Input value={form.agency_name} onChange={(e) => setForm({ ...form, agency_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mission</Label>
              <Textarea rows={2} value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Vision</Label>
              <Textarea rows={2} value={form.vision} onChange={(e) => setForm({ ...form, vision: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" /> Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Twitter</Label>
                <Input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
            <Save className="mr-2 h-4 w-4" /> {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
