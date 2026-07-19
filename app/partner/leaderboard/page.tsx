'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Crown, Medal, Users, DollarSign, Loader as Loader2 } from 'lucide-react';
import { supabase, Profile, Client, Commission } from '@/lib/supabase';
import { formatCurrency } from '@/lib/data';

type LeaderRow = {
  partner: Profile;
  clientsThisMonth: number;
  completedProjects: number;
  commissionEarned: number;
};

export default function PartnerLeaderboardPage() {
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Fetch all partners
      const { data: partners } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'partner')
        .order('created_at', { ascending: true });

      const allPartners = (partners as Profile[]) || [];

      // Fetch all clients and commissions in one pass each, then bucket per partner
      const { data: allClients } = await supabase.from('clients').select('id, partner_id, status, created_at');
      const { data: allComms } = await supabase.from('commissions').select('partner_id, amount, status');

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const built: LeaderRow[] = allPartners.map((partner) => {
        const pClients = (allClients as Client[] | null)?.filter((c) => c.partner_id === partner.id) || [];
        const pComms = (allComms as Commission[] | null)?.filter((c) => c.partner_id === partner.id) || [];

        const clientsThisMonth = pClients.filter(
          (c) => new Date(c.created_at) >= monthStart
        ).length;
        const completedProjects = pClients.filter((c) => c.status === 'completed').length;
        const commissionEarned = pComms
          .filter((c) => c.status === 'paid')
          .reduce((sum, c) => sum + Number(c.amount), 0);

        return { partner, clientsThisMonth, completedProjects, commissionEarned };
      });

      // Rank by commission earned (desc), then completed projects
      built.sort(
        (a, b) =>
          b.commissionEarned - a.commissionEarned || b.completedProjects - a.completedProjects
      );

      setRows(built);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const topPartner = rows[0];

  const rankBadge = (index: number) => {
    if (index === 0)
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Crown className="h-5 w-5" />
        </span>
      );
    if (index === 1)
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-stone-600">
          <Medal className="h-5 w-5" />
        </span>
      );
    if (index === 2)
      return (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <Medal className="h-5 w-5" />
        </span>
      );
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Partner Leaderboard</h2>
          <p className="text-sm text-muted-foreground">
            See how you stack up against other partners this month.
          </p>
        </div>
      </div>

      {/* Reward banner */}
      <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Trophy className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-amber-900">
            The best-performing partner every month receives a cash reward.
          </p>
        </CardContent>
      </Card>

      {/* Top partner highlight */}
      {topPartner && (
        <Card className="overflow-hidden border-amber-300">
          <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 p-6 text-center sm:flex-row sm:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg">
              <Crown className="h-9 w-9" />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Top Partner
                </span>
              </div>
              <h3 className="text-xl font-bold text-amber-900">
                {topPartner.partner.full_name || topPartner.partner.email}
              </h3>
              <p className="text-sm text-amber-700">
                Leading with{' '}
                {formatCurrency(topPartner.commissionEarned)} earned and{' '}
                {topPartner.completedProjects} completed projects this period.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard table */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No partners yet</p>
                <p className="text-sm text-muted-foreground">
                  The leaderboard will populate once partners start referring clients.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Partner Name</TableHead>
                  <TableHead>Clients This Month</TableHead>
                  <TableHead>Completed Projects</TableHead>
                  <TableHead>Commission Earned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => {
                  const isTop = index === 0;
                  return (
                    <TableRow
                      key={row.partner.id}
                      className={isTop ? 'bg-amber-50/60' : undefined}
                    >
                      <TableCell>{rankBadge(index)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {row.partner.full_name || row.partner.email}
                          </span>
                          {isTop && (
                            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                              Leader
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {row.clientsThisMonth}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.completedProjects}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                          <DollarSign className="h-3.5 w-3.5" />
                          {formatCurrency(row.commissionEarned)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
