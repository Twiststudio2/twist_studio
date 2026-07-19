'use client';

import { DashboardLayout, ProtectedRoute, StatCard } from '@/components/dashboard-layout';
import { LayoutDashboard, Briefcase, Clock, CircleCheck as CheckCircle2, DollarSign, Bell, MessageSquare, Upload } from 'lucide-react';

const NAV = [
  { href: '/creative', label: 'Overview', icon: LayoutDashboard },
  { href: '/creative/jobs', label: 'Assigned Jobs', icon: Briefcase },
  { href: '/creative/payments', label: 'Payments', icon: DollarSign },
  { href: '/creative/notifications', label: 'Notifications', icon: Bell },
];

export default function CreativeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="creative">
      <DashboardLayout navItems={NAV} title="Creative Dashboard" role="creative">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
