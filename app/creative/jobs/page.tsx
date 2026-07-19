'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, Clock, DollarSign, Upload, RotateCcw, Download, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/data';
import { JOB_STATUS_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';
import { FileUpload } from '@/components/file-upload';

export default function CreativeJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadJob, setUploadJob] = useState<any>(null);
  const [finalWorkUrl, setFinalWorkUrl] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('creative_jobs').select('*').eq('creative_id', user.id).order('created_at', { ascending: false });
      setJobs(data || []);
      setLoading(false);
    })();
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('creative_jobs').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Status updated');
      setJobs((j) => j.map((job) => job.id === id ? { ...job, status } : job));
    }
  };

  const submitWork = async () => {
    if (!uploadJob || !finalWorkUrl) return;
    const { error } = await supabase.from('creative_jobs').update({
      final_work_url: finalWorkUrl, status: 'completed',
    }).eq('id', uploadJob.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Final work submitted!');
      setJobs((j) => j.map((job) => job.id === uploadJob.id ? { ...job, final_work_url: finalWorkUrl, status: 'completed' } : job));
      setUploadJob(null);
      setFinalWorkUrl('');
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Assigned Jobs</h2>
        <p className="text-muted-foreground">All jobs assigned to you by the admin team.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.length > 0 ? jobs.map((job) => {
          const cfg = JOB_STATUS_CONFIG[job.status] || { label: job.status, color: '', bg: '' };
          return (
            <Card key={job.id} className="flex flex-col border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className={cfg.bg + ' ' + cfg.color}>{cfg.label}</Badge>
                  {job.payment_status === 'paid' && <Badge className="bg-emerald-100 text-emerald-700">Paid</Badge>}
                </div>
                <CardTitle className="text-lg">{job.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="mb-4 text-sm text-muted-foreground">{job.description || 'No description provided.'}</p>
                <div className="mb-4 space-y-1.5 text-xs text-muted-foreground">
                  {job.deadline && <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Deadline: {formatDate(job.deadline)}</div>}
                  {job.payment_amount && <div className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Payment: {formatCurrency(job.payment_amount)}</div>}
                  {job.brief_url && <a href={job.brief_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline"><Download className="h-3.5 w-3.5" /> Download Brief</a>}
                  {job.final_work_url && <a href={job.final_work_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline"><FileText className="h-3.5 w-3.5" /> View Final Work</a>}
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  {job.status === 'assigned' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(job.id, 'in_progress')}>Start Work</Button>
                  )}
                  {job.status === 'in_progress' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(job.id, 'revision')}>Request Revision</Button>
                  )}
                  {job.status !== 'completed' && job.status !== 'cancelled' && (
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setUploadJob(job); setFinalWorkUrl(job.final_work_url || ''); }}>
                      <Upload className="mr-1 h-3 w-3" /> Submit Work
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <Card className="col-span-full border-dashed border-border/60">
            <CardContent className="py-16 text-center">
              <Briefcase className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">No jobs assigned yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!uploadJob} onOpenChange={(o) => !o && setUploadJob(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Final Work</DialogTitle>
            <DialogDescription>Provide a link to your completed work{uploadJob ? ` for "${uploadJob.title}"` : ''}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Final Work</Label>
              <FileUpload
                value={finalWorkUrl}
                onChange={setFinalWorkUrl}
                folder={`creative-work/${uploadJob?.id || 'general'}`}
                maxSizeMb={100}
                kind="file"
                label="Upload Your Work"
              />
            </div>
            <Button onClick={submitWork} disabled={!finalWorkUrl} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Submit Completed Work
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
