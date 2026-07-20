'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { LogOut, Menu, X, Bell } from 'lucide-react';

type NavItem = { href: string; label: string; icon: any };

export function DashboardLayout({
  children,
  navItems,
  title,
  role,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
  role: 'admin' | 'partner' | 'creative' | 'hr';
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const roleColor = role === 'admin' ? 'text-rose-600 bg-rose-50' : role === 'partner' ? 'text-primary bg-primary/10' : role === 'hr' ? 'text-teal-700 bg-teal-100' : 'text-accent bg-accent/10';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/"><Logo showText={false} /></Link>
          <span className="ml-2 text-sm font-bold">Twist Studio</span>
        </div>
        <div className="px-3 py-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{profile?.full_name || 'User'}</div>
              <div className={cn('inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase', roleColor)}>{role}</div>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto border-t border-border p-4">
          <Button onClick={handleSignOut} variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link href="/"><Logo showText={false} /></Link>
        <span className="text-sm font-bold">{title}</span>
        <button onClick={() => setOpen(true)}><Menu className="h-6 w-6" /></button>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Logo />
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="border-t border-border p-4">
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        <div className="hidden h-16 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur-sm lg:flex">
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="flex items-center gap-3">
            <Link href={`/${role}/notifications`} className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
              <Bell className="h-4 w-4" />
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to site</Link>
          </div>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, color = 'primary' }: { icon: any; label: string; value: string | number; color?: string }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    violet: 'bg-violet-100 text-violet-600',
    rose: 'bg-rose-100 text-rose-600',
    amber: 'bg-amber-100 text-amber-600',
  };
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-lg', colorMap[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

const normalizeRole = (role?: string) => role?.toLowerCase().trim();

export function ProtectedRoute({ role, children }: { role: 'admin' | 'partner' | 'creative' | 'hr'; children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const userRole = normalizeRole(profile?.role);
  if (profile && userRole !== role) {
    const dash: Record<string, string> = { admin: '/admin', partner: '/partner', creative: '/creative', hr: '/hr' };
    router.push((userRole && dash[userRole]) || '/');
    return null;
  }

  return <>{children}</>;
}
