'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Lock, Loader as Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const normalizeRole = (role?: string) => role?.toLowerCase().trim();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session fetch error:', error);
          return;
        }
        if (session) {
          const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
          if (profileError) {
            console.error('Profile fetch error:', profileError);
            return;
          }
          const role = normalizeRole(profile?.role);
          if (role === 'admin') router.push('/admin');
          else if (role === 'partner') router.push('/partner');
          else if (role === 'creative') router.push('/creative');
          else if (role === 'hr') router.push('/hr');
        }
      } catch (err) {
        console.error('Error checking session:', err);
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Login failed. Please try again.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      if (profile?.status === 'suspended') {
        toast.error('Your account has been suspended. Contact support.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      toast.success('Welcome back!');
      const role = normalizeRole(profile?.role);
      if (role === 'admin') router.push('/admin');
      else if (role === 'partner') router.push('/partner');
      else if (role === 'creative') router.push('/creative');
      else if (role === 'hr') router.push('/hr');
      else router.push('/');
    } catch (error: any) {
      toast.error(error?.message || 'Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <div className="relative hidden flex-1 overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Logo className="[&_*]:!text-primary-foreground" />
          <div>
            <h2 className="text-balance text-4xl font-bold leading-tight">Welcome back to Africa&apos;s creative powerhouse.</h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">Sign in to manage your projects, clients, and creative work.</p>
          </div>
          <p className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} Twist Studio</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <Card className="border-border/60">
            <CardHeader>
              <div className="mb-2 lg:hidden"><Logo /></div>
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
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
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
