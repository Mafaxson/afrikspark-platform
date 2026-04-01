import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X, MessageSquare, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
}

interface Profile {
  user_id: string;
  display_name: string | null;
  avatar_url?: string;
}

interface Props {
  onViewProfile: (userId: string) => void;
  onMessage: (userId: string) => void;
}

export function ConnectionsList({ onViewProfile, onMessage }: Props) {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const { toast } = useToast();

  const fetchConnections = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("connections").select("*")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    if (!data) return;
    setConnections(data);

    const userIds = new Set<string>();
    data.forEach(c => { userIds.add(c.requester_id); userIds.add(c.receiver_id); });
    userIds.delete(user.id);

    const { data: profs } = await supabase.from("profiles").select("user_id, display_name, avatar_url, career_interest")
      .in("user_id", Array.from(userIds));
    if (profs) {
      const map: Record<string, Profile> = {};
      profs.forEach(p => { map[p.user_id] = p; });
      setProfiles(map);
    }
  }, [user]);

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  const handleAccept = async (id: string) => {
    await supabase.from("connections").update({ status: "accepted" }).eq("id", id);
    toast({ title: "Connection accepted!" });
    fetchConnections();
  };

  const handleDecline = async (id: string) => {
    await supabase.from("connections").delete().eq("id", id);
    toast({ title: "Connection declined" });
    fetchConnections();
  };

  const pending = connections.filter(c => c.status === "pending" && c.receiver_id === user?.id);
  const accepted = connections.filter(c => c.status === "accepted");
  const sentPending = connections.filter(c => c.status === "pending" && c.requester_id === user?.id);

  const getOtherUserId = (c: Connection) => c.requester_id === user?.id ? c.receiver_id : c.requester_id;

  const renderUser = (userId: string, actions: React.ReactNode) => {
    const p = profiles[userId];
    return (
      <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
        <button onClick={() => onViewProfile(userId)} className="shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {p?.avatar_url ? (
              <img src={p.avatar_url} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-primary">{(p?.display_name ?? "U").charAt(0).toUpperCase()}</span>
            )}
          </div>
        </button>
        <div className="flex-1 min-w-0">
          <button onClick={() => onViewProfile(userId)} className="font-semibold text-sm hover:text-primary transition">
            {p?.display_name ?? "Member"}
          </button>
          {p?.career_interest && <p className="text-xs text-muted-foreground">{p.career_interest}</p>}
        </div>
        {actions}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 max-w-2xl mx-auto">
      <h2 className="font-display text-xl font-bold">Connections</h2>

      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pending Requests ({pending.length})</h3>
          <div className="space-y-2">
            {pending.map(c => renderUser(c.requester_id, (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleAccept(c.id)}><Check className="h-4 w-4 text-green-600" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDecline(c.id)}><X className="h-4 w-4 text-destructive" /></Button>
              </div>
            )))}
          </div>
        </div>
      )}

      {accepted.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">My Connections ({accepted.length})</h3>
          <div className="space-y-2">
            {accepted.map(c => {
              const otherId = getOtherUserId(c);
              return (
                <div key={c.id}>
                  {renderUser(otherId, (
                    <Button size="sm" variant="ghost" onClick={() => onMessage(otherId)}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sentPending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sent Requests ({sentPending.length})</h3>
          <div className="space-y-2">
            {sentPending.map(c => renderUser(c.receiver_id, (
              <span className="text-xs text-muted-foreground">Pending</span>
            )))}
          </div>
        </div>
      )}

      {connections.length === 0 && (
        <p className="text-muted-foreground text-center py-10">No connections yet. Visit the Directory to find and connect with members!</p>
      )}
    </div>
  );
}
