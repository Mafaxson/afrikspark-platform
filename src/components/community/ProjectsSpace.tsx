import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, UserPlus, Check, Trash2, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Project {
  id: string;
  title: string;
  description: string;
  skills_needed: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Profile {
  user_id: string;
  display_name: string;
  avatar_url?: string;
}

interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  status: string;
  joined_at: string;
}

interface Props {
  onViewProfile: (userId: string) => void;
}

export function ProjectsSpace({ onViewProfile }: Props) {
  const { user, isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsNeeded, setSkillsNeeded] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['projectsSpace'],
    queryFn: async () => {
      const [projectsRes, profilesRes, membersRes] = await Promise.all([
        supabase.from("community_projects").select("id, title, description, status, skills_needed, created_by").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, display_name"),
        supabase.from("project_members").select("project_id, user_id, status")
      ]);

      return {
        projects: projectsRes.data || [],
        profiles: profilesRes.data || [],
        members: membersRes.data || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const projects = data?.projects || [];
  const profiles = data?.profiles || [];
  const members = data?.members || [];

  const handleCreate = async () => {
    if (!title.trim() || !user) return;
    const skills = skillsNeeded.split(",").map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from("community_projects").insert({
      title, description, skills_needed: skills, created_by: user.id,
    });
    if (!error) {
      toast({ title: "Project created!" });
      setTitle(""); setDescription(""); setSkillsNeeded(""); setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['projectsSpace'] });
    }
  };

  const joinProject = async (projectId: string) => {
    if (!user) return;
    const { error } = await supabase.from("project_members").insert({ project_id: projectId, user_id: user.id });
    if (!error) {
      toast({ title: "Join request sent!" });
      queryClient.invalidateQueries({ queryKey: ['projectsSpace'] });
    }
  };

  const getMemberStatus = (projectId: string) => {
    return members.find(m => m.project_id === projectId && m.user_id === user?.id)?.status ?? null;
  };

  const getProjectMembers = (projectId: string) => {
    return members.filter(m => m.project_id === projectId && m.status === "accepted").length;
  };

  const handleDelete = async (id: string) => {
    await supabase.from("community_projects").delete().eq("id", id);
    toast({ title: "Project deleted" });
    queryClient.invalidateQueries({ queryKey: ['projectsSpace'] });
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Project Collaboration</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> New Project
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <Input placeholder="Project title" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Describe your project idea..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          <Input placeholder="Skills needed (comma-separated)" value={skillsNeeded} onChange={e => setSkillsNeeded(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate}>Post Project</Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                    <div className="flex gap-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))
        ) : (
          projects.map(p => {
            const memberStatus = getMemberStatus(p.id);
            const memberCount = getProjectMembers(p.id);
            const isOwner = p.created_by === user?.id;

            return (
              <div key={p.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{p.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          p.status === "open" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                        }`}>{p.status}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" /> {memberCount} members
                        </span>
                      </div>
                      {p.description && <p className="text-sm text-muted-foreground mt-2">{p.description}</p>}
                      {(p.skills_needed ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(p.skills_needed as string[]).map((s: string) => (
                            <span key={s} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      )}
                      <button onClick={() => onViewProfile(p.created_by)} className="text-xs text-muted-foreground mt-2 hover:text-primary transition">
                        By {profiles.find(pr => pr.user_id === p.created_by)?.display_name ?? "Member"}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!isOwner && memberStatus === null && p.status === "open" && (
                      <Button size="sm" onClick={() => joinProject(p.id)}>
                        <UserPlus className="h-4 w-4 mr-1" /> Join
                      </Button>
                    )}
                    {memberStatus === "pending" && <span className="text-xs text-muted-foreground py-2">Pending</span>}
                    {memberStatus === "accepted" && <span className="text-xs text-primary py-2 flex items-center gap-1"><Check className="h-3 w-3" /> Joined</span>}
                    {(isOwner || isAdmin) && (
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {!loading && projects.length === 0 && (
          <p className="text-muted-foreground text-center py-10">No projects yet. Start a collaboration!</p>
        )}
      </div>
    </div>
  );
}
