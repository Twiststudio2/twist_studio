'use client';

import { DashboardLayout, ProtectedRoute } from '@/components/dashboard-layout';
import { LayoutDashboard, Image, Wrench, Users, Palette, Briefcase, DollarSign, FileText, Megaphone, Bell, ChartBar as BarChart3, Settings, UserCog } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/portfolio', label: 'Portfolio', icon: Image },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/partner-applications', label: 'Partner Apps', icon: Users },
  { href: '/admin/creative-applications', label: 'Creative Apps', icon: Palette },
  { href: '/admin/partners', label: 'Partners', icon: Briefcase },
  { href: '/admin/creatives', label: 'Creatives', icon: Palette },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/commissions', label: 'Commissions', icon: DollarSign },
  { href: '/admin/payments', label: 'Payments', icon: FileText },
  { href: '/admin/marketing', label: 'Marketing Files', icon: Megaphone },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/users', label: 'User Mgmt', icon: UserCog },
  { href: '/admin/hr', label: 'HR Managers', icon: UserCog },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="admin">
      <DashboardLayout navItems={NAV} title="Admin Dashboard" role="admin">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
