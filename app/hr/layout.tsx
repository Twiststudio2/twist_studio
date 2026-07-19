'use client';

import { DashboardLayout, ProtectedRoute } from '@/components/dashboard-layout';
import {
  LayoutDashboard, Users, UserPlus, DollarSign, Bell
} from 'lucide-react';

const NAV = [
  { href: '/hr', label: 'Overview', icon: LayoutDashboard },
  { href: '/hr/recruit', label: 'Recruit Partner', icon: UserPlus },
  { href: '/hr/partners', label: 'My Partners', icon: Users },
  { href: '/hr/commissions', label: 'Commissions', icon: DollarSign },
  { href: '/hr/notifications', label: 'Notifications', icon: Bell },
];

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="hr">
      <DashboardLayout navItems={NAV} title="HR Dashboard" role="hr">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
