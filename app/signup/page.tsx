'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Lock, User, Loader as Loader2, Briefcase, Palette, Shield, Check, UserCog } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ROLES = [
  { key: 'partner', label: 'Partner', desc: 'Refer clients and earn commission', icon: Briefcase },
  { key: 'creative', label: 'Creative', desc: 'Join our team of designers', icon: Palette },
  { key: 'admin', label: 'Admin', desc: 'Manage the platform', icon: Shield },
];

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [referrerId, setReferrerId] = useState<string>('');

  useEffect(() => {
    const inviteRole = searchParams.get('role');
    const ref = searchParams.get('ref');
    if (inviteRole === 'hr') {
      setRole('hr');
      setStep('details');
    }
    if (inviteRole === 'partner') {
      setRole('partner');
      setStep('details');
    }
    if (ref) setReferrerId(ref);
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
        status: role === 'admin' ? 'active' : 'active',
        ...(role === 'partner' && referrerId ? { recruited_by_hr_id: referrerId } : {}),
      });

      if (role === 'partner') {
        router.push('/apply/partner');
      } else if (role === 'creative') {
        router.push('/apply/creative');
      } else if (role === 'hr') {
        toast.success('HR account created successfully');
        router.push('/hr');
      } else {
        toast.success('Admin account created. Awaiting super admin approval.');
        router.push('/login');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <div className="relative hidden flex-1 overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Logo className="[&_*]:!text-primary-foreground" />
          <div>
            <h2 className="text-balance text-4xl font-bold leading-tight">Join the Twist Studio family.</h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">Whether you&apos;re a partner or a creative, there&apos;s a place for you here.</p>
          </div>
          <p className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} Twist Studio</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          {step === 'role' ? (
            <Card className="border-border/60">
              <CardHeader>
                <div className="mb-2 lg:hidden"><Logo /></div>
                <CardTitle className="text-2xl">Create your account</CardTitle>
                <CardDescription>Choose how you want to join Twist Studio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {ROLES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => { setRole(r.key); setStep('details'); }}
                    className="group flex w-full items-center gap-4 rounded-xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <r.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{r.label}</div>
                      <div className="text-sm text-muted-foreground">{r.desc}</div>
                    </div>
                    <Check className={cn('h-5 w-5 text-primary opacity-0 transition-opacity group-hover:opacity-100')} />
                  </button>
                ))}
                <p className="pt-4 text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {role === 'partner' && 'Partner Sign Up'}
                  {role === 'creative' && 'Creative Sign Up'}
                  {role === 'admin' && 'Admin Sign Up'}
                  {role === 'hr' && 'HR Manager Sign Up'}
                </CardTitle>
                <CardDescription>Fill in your details to create your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className="pl-9" />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                  </Button>
                </form>
                <button onClick={() => setStep('role')} className="mt-4 text-sm text-muted-foreground hover:text-foreground">
                  ← Choose a different role
                </button>
                <p className="pt-2 text-xs text-muted-foreground">
                  {role === 'partner' && 'After signup, you\'ll complete a partner application.'}
                  {role === 'creative' && 'After signup, you\'ll complete a creative application.'}
                  {role === 'admin' && 'Admin accounts require super admin approval.'}
                  {role === 'hr' && 'You\'ll be redirected to your HR dashboard after signup.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
