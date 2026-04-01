import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => { if (data) setNotifications(data as Notification[]); });
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-full overflow-y-auto p-4 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Notifications</h2>
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.map(n => (
        <div
          key={n.id}
          className={`bg-card rounded-xl border p-4 transition-colors ${
            n.read ? "border-border" : "border-primary/30 bg-primary/5"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                n.read ? "bg-muted" : "bg-primary/10"
              }`}>
                <Bell className={`h-4 w-4 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
              </div>
              <div>
                <h4 className="text-sm font-semibold">{n.title}</h4>
                {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            {!n.read && (
              <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {notifications.length === 0 && (
        <p className="text-muted-foreground text-center py-10">No notifications yet.</p>
      )}
    </div>
  );
}
