'use client';

import { DashboardLayout, ProtectedRoute, StatCard } from '@/components/dashboard-layout';
import {
  LayoutDashboard, Users, DollarSign, Trophy, Download, Image, FileText, Bell
} from 'lucide-react';

const NAV = [
  { href: '/partner', label: 'Overview', icon: LayoutDashboard },
  { href: '/partner/submit-client', label: 'Submit Client', icon: Users },
  { href: '/partner/clients', label: 'Client Status', icon: FileText },
  { href: '/partner/commissions', label: 'Commission', icon: DollarSign },
  { href: '/partner/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/partner/marketing', label: 'Marketing Files', icon: Download },
  { href: '/partner/portfolio', label: 'Portfolio', icon: Image },
  { href: '/partner/pricing', label: 'Price List', icon: FileText },
  { href: '/partner/notifications', label: 'Notifications', icon: Bell },
];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role="partner">
      <DashboardLayout navItems={NAV} title="Partner Dashboard" role="partner">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
