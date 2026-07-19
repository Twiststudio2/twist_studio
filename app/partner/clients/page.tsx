'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Filter, Search, Loader as Loader2 } from 'lucide-react';
import { supabase, Client } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate } from '@/lib/data';
import { CLIENT_STATUS_CONFIG } from '@/lib/constants';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'received', label: 'Received' },
  { key: 'working', label: 'Working' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'abandoned', label: 'Abandoned' },
] as const;

export default function PartnerClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false });
      setClients((data as Client[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        c.client_name?.toLowerCase().includes(q) ||
        c.business_name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [clients, statusFilter, query]);

  const countFor = (key: string) =>
    key === 'all' ? clients.length : clients.filter((c) => c.status === key).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Your Clients</h2>
          <p className="text-sm text-muted-foreground">
            Track the status of every client you have submitted.
          </p>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="flex h-auto flex-wrap">
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.key} value={t.key} className="gap-1.5">
                <Filter className="h-3 w-3" />
                {t.label}
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                  {countFor(t.key)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Card className="mt-4 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">
              {filtered.length} {filtered.length === 1 ? 'Client' : 'Clients'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Users className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No clients found</p>
                  <p className="text-sm text-muted-foreground">
                    {query || statusFilter !== 'all'
                      ? 'Try adjusting your filters or search.'
                      : 'Submit your first client to get started.'}
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const cfg = CLIENT_STATUS_CONFIG[c.status] || {
                      label: c.status,
                      color: 'text-stone-700',
                      bg: 'bg-stone-100 border-stone-200',
                    };
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.client_name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.business_name || '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{c.phone || '—'}</TableCell>
                        <TableCell>
                          <Badge className={`${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(c.estimated_budget)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(c.created_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
