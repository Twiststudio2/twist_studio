'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Clock, CircleCheck as CheckCircle2, DollarSign, Upload, RotateCcw, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate } from '@/lib/data';
import { JOB_STATUS_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';

export default function CreativeOverview() {
  const { user, profile } = useAuth();
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

  const stats = {
    assigned: jobs.filter((j) => j.status === 'assigned' || j.status === 'in_progress').length,
    deadlines: jobs.filter((j) => j.deadline && j.status !== 'completed' && j.status !== 'cancelled').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    earnings: jobs.filter((j) => j.payment_status === 'paid').reduce((s, j) => s + Number(j.payment_amount || 0), 0),
  };

  const updateJobStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('creative_jobs').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Status updated');
      setJobs((j) => j.map((job) => job.id === id ? { ...job, status } : job));
    }
  };

  const uploadFinalWork = async () => {
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
        <h2 className="text-2xl font-bold">Welcome, {profile?.full_name || 'Creative'}</h2>
        <p className="text-muted-foreground">Your creative workspace at Twist Studio.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Active Jobs" value={stats.assigned} color="primary" />
        <StatCard icon={Calendar} label="Upcoming Deadlines" value={stats.deadlines} color="amber" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="emerald" />
        <StatCard icon={DollarSign} label="Total Earnings" value={formatCurrency(stats.earnings)} color="accent" />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Current Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jobs.filter((j) => j.status !== 'completed' && j.status !== 'cancelled').length > 0 ? (
              jobs.filter((j) => j.status !== 'completed' && j.status !== 'cancelled').map((job) => {
                const cfg = JOB_STATUS_CONFIG[job.status] || { label: job.status, color: '', bg: '' };
                return (
                  <div key={job.id} className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{job.title}</h4>
                        <Badge className={cfg.bg + ' ' + cfg.color}>{cfg.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{job.description}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {job.deadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due {formatDate(job.deadline)}</span>}
                        {job.payment_amount && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {formatCurrency(job.payment_amount)}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {job.status === 'assigned' && (
                        <Button size="sm" variant="outline" onClick={() => updateJobStatus(job.id, 'in_progress')}>Start</Button>
                      )}
                      {job.status === 'in_progress' && (
                        <Button size="sm" variant="outline" onClick={() => updateJobStatus(job.id, 'revision')}>
                          <RotateCcw className="mr-1 h-3 w-3" /> Request Revision
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setUploadJob(job); setFinalWorkUrl(''); }}>
                            <Upload className="mr-1 h-3 w-3" /> Submit Work
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Final Work</DialogTitle>
                            <DialogDescription>Provide a link to your completed work for &ldquo;{job.title}&rdquo;.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Final Work URL</Label>
                              <Input value={finalWorkUrl} onChange={(e) => setFinalWorkUrl(e.target.value)} placeholder="https://..." />
                            </div>
                            <Button onClick={uploadFinalWork} disabled={!finalWorkUrl} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                              Submit Completed Work
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-center text-muted-foreground">No active tasks. Jobs assigned by admin will appear here.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Job History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Job</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Payment</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length > 0 ? jobs.map((job) => {
                  const cfg = JOB_STATUS_CONFIG[job.status] || { label: job.status, color: '', bg: '' };
                  return (
                    <tr key={job.id} className="border-b border-border/40 last:border-0">
                      <td className="py-3 font-medium">{job.title}</td>
                      <td className="py-3"><Badge className={cfg.bg + ' ' + cfg.color}>{cfg.label}</Badge></td>
                      <td className="py-3">{formatCurrency(job.payment_amount)}</td>
                      <td className="py-3 text-muted-foreground">{formatDate(job.created_at)}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No jobs yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
