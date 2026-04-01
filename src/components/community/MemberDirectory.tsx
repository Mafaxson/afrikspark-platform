import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, MessageSquare, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface Member {
  user_id: string;
  display_name: string | null;
  avatar_url?: string;
  career_interest?: string;
  location: string | null;
  cohort_id: string | null;
  skills: string[] | null;
  cohorts?: { name: string };
}

interface Cohort {
  id: string;
  name: string;
  year: number;
  description: string | null;
}

interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
}

interface Props {
  onViewProfile: (userId: string) => void;
  onMessage: (userId: string) => void;
}

export function MemberDirectory({ onViewProfile, onMessage }: Props) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCohort, setFilterCohort] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['memberDirectory'],
    queryFn: async () => {
      const [membersRes, cohortsRes, connectionsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, avatar_url, career_interest, location, cohort_id, skills, cohorts(name)").eq("approved", true).order("display_name"),
        supabase.from("cohorts").select("id, name, year, description").order("year", { ascending: false }),
        user ? supabase.from("connections").select("id, requester_id, receiver_id, status").or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`) : Promise.resolve({ data: [] })
      ]);

      return {
        members: membersRes.data || [],
        cohorts: cohortsRes.data || [],
        connections: connectionsRes.data || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const members = data?.members || [];
  const cohorts = data?.cohorts || [];
  const connections = data?.connections || [];

  const getConnectionStatus = (memberId: string) => {
    const conn = connections.find(c => c.requester_id === user?.id && c.receiver_id === memberId || c.receiver_id === user?.id && c.requester_id === memberId);
    return conn?.status ?? null;
  };

  const sendConnectionRequest = async (receiverId: string) => {
    if (!user) return;
    const { data, error } = await supabase.from("connections").insert({
      requester_id: user.id,
      receiver_id: receiverId,
    }).select().single();
    if (data) {
      setConnections([...connections, data]);
      // Send notification
      await supabase.from("notifications").insert({
        user_id: receiverId,
        type: "connection_request",
        title: "New Connection Request",
        body: "Someone wants to connect with you!",
        link: "connections",
      });
      toast({ title: "Connection request sent!" });
    }
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const allSkills = Array.from(new Set(members.flatMap(m => m.skills ?? [])));

  const filtered = members.filter(m => {
    if (m.user_id === user?.id) return false;
    const matchesSearch = !searchTerm || 
      m.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.career_interest?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCohort = !filterCohort || m.cohort_id === filterCohort;
    const matchesSkill = !filterSkill || (m.skills ?? []).includes(filterSkill);
    return matchesSearch && matchesCohort && matchesSkill;
  });

  return (
    <div className="flex flex-col h-full">
      {isLoading ? (
        <div className="flex-1 p-4">
          <div className="mb-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12 rounded" />
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  <Skeleton className="h-6 flex-1" />
                  <Skeleton className="h-6 flex-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 border-b border-border bg-card space-y-3">
            <h2 className="font-display text-xl font-bold">Member Directory</h2>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, location, or interest..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[140px]"
                value={filterCohort}
                onChange={e => setFilterCohort(e.target.value)}
              >
                <option value="">All Cohorts</option>
                {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[140px]"
                value={filterSkill}
                onChange={e => setFilterSkill(e.target.value)}
              >
                <option value="">All Skills</option>
                {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">{filtered.length} members found</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(m => {
                const connStatus = getConnectionStatus(m.user_id);
                return (
                  <div key={m.user_id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <button onClick={() => onViewProfile(m.user_id)} className="shrink-0">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {m.avatar_url ? (
                            <img src={m.avatar_url} className="h-12 w-12 rounded-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-primary">
                              {(m.display_name ?? "U").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <button onClick={() => onViewProfile(m.user_id)} className="text-sm font-semibold hover:text-primary transition truncate block">
                          {m.display_name ?? "Member"}
                        </button>
                        {m.career_interest && <p className="text-xs text-muted-foreground truncate">{m.career_interest}</p>}
                        {m.location && <p className="text-xs text-muted-foreground">{m.location}</p>}
                        {m.cohorts?.name && (
                          <span className="inline-block text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded mt-1">{m.cohorts.name}</span>
                        )}
                      </div>
                    </div>
                    {(m.skills ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(m.skills as string[]).slice(0, 3).map((s: string) => (
                          <span key={s} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{s}</span>
                        ))}
                        {(m.skills as string[]).length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{(m.skills as string[]).length - 3}</span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-1 mt-3">
                      <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs" onClick={() => onMessage(m.user_id)}>
                        <MessageSquare className="h-3 w-3 mr-1" /> Message
                      </Button>
                      {connStatus === null && (
                        <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => sendConnectionRequest(m.user_id)}>
                          <UserPlus className="h-3 w-3 mr-1" /> Connect
                        </Button>
                      )}
                      {connStatus === "pending" && (
                        <span className="flex-1 text-center text-xs text-muted-foreground py-1.5">Pending</span>
                      )}
                      {connStatus === "accepted" && (
                        <span className="flex-1 text-center text-xs text-primary py-1.5">Connected</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
