'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/data';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-600', success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600', error: 'bg-rose-100 text-rose-600',
};

export default function PartnerNotificationsPage() {
  const { user } = useAuth() as any;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setNotifications(data || []);
      setLoading(false);
    })();
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((n) => n.map((item) => item.id === id ? { ...item, is_read: true } : item));
  };

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((n) => n.filter((item) => item.id !== id));
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="text-muted-foreground">Stay updated with the latest announcements.</p>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? notifications.map((n) => (
          <Card key={n.id} className={cn('border-border/60 transition-colors', !n.is_read && 'border-primary/30 bg-primary/5')}>
            <CardContent className="flex items-start gap-4 p-4">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', TYPE_COLORS[n.type] || TYPE_COLORS.info)}>
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{n.title}</h3>
                  {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
              </div>
              <div className="flex gap-1">
                {!n.is_read && (
                  <Button size="icon" variant="ghost" onClick={() => markRead(n.id)} title="Mark as read">
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => deleteNotif(n.id)} title="Delete">
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="border-dashed border-border/60">
            <CardContent className="py-16 text-center">
              <Bell className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">No notifications yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
