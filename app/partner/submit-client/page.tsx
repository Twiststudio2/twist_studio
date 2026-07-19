'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Send, Loader as Loader2, Phone, MessageCircle, MapPin, Wallet, FileText, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { SERVICES_CATEGORIES } from '@/lib/constants';

const EMPTY = {
  client_name: '',
  business_name: '',
  phone: '',
  whatsapp: '',
  location: '',
  services_needed: '',
  estimated_budget: '',
  additional_notes: '',
};

export default function SubmitClientPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof typeof EMPTY, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be signed in to submit a client.');
      return;
    }
    if (!form.client_name.trim() || !form.phone.trim()) {
      toast.error('Please fill in the required fields: Client Name and Phone.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('clients').insert({
      partner_id: user.id,
      client_name: form.client_name.trim(),
      business_name: form.business_name.trim() || null,
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || null,
      location: form.location.trim() || null,
      services_needed: form.services_needed.trim() || null,
      estimated_budget: form.estimated_budget ? Number(form.estimated_budget) : null,
      additional_notes: form.additional_notes.trim() || null,
      status: 'pending',
    });

    setSubmitting(false);

    if (error) {
      toast.error('Failed to submit client. Please try again.');
      return;
    }

    toast.success('Client submitted successfully!', {
      description: `${form.client_name} has been added to your client list.`,
    });
    setForm(EMPTY);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Submit a New Client</h2>
          <p className="text-sm text-muted-foreground">
            Refer a potential client and start earning commissions on completed projects.
          </p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Client Details</CardTitle>
          <CardDescription>
            Provide as much detail as possible so our team can follow up quickly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="client_name" className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Client Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="client_name"
                  placeholder="e.g. John Mensah"
                  value={form.client_name}
                  onChange={(e) => handleChange('client_name', e.target.value)}
                  required
                />
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="business_name" className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  Business Name
                </Label>
                <Input
                  id="business_name"
                  placeholder="e.g. Mensah Enterprises"
                  value={form.business_name}
                  onChange={(e) => handleChange('business_name', e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="e.g. +233 24 000 0000"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-primary" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="e.g. +233 24 000 0000"
                  value={form.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Accra, Ghana"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>

              {/* Estimated Budget */}
              <div className="space-y-2">
                <Label htmlFor="estimated_budget" className="flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-primary" />
                  Estimated Budget (GHS)
                </Label>
                <Input
                  id="estimated_budget"
                  type="number"
                  min="0"
                  placeholder="e.g. 5000"
                  value={form.estimated_budget}
                  onChange={(e) => handleChange('estimated_budget', e.target.value)}
                />
              </div>
            </div>

            {/* Services Needed */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Services Needed
              </Label>
              <Select
                value={form.services_needed || undefined}
                onValueChange={(v) => handleChange('services_needed', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES_CATEGORIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="additional_notes" className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Additional Notes
              </Label>
              <Textarea
                id="additional_notes"
                placeholder="Any extra details about the client or their project requirements…"
                rows={4}
                value={form.additional_notes}
                onChange={(e) => handleChange('additional_notes', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setForm(EMPTY)}
                disabled={submitting}
              >
                Reset
              </Button>
              <Button type="submit" disabled={submitting} className="min-w-[140px]">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Submit Client
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
