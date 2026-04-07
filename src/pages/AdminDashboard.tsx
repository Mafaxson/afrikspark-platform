import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getTestimonialSource } from "@/lib/testimonials";
import { Layout } from "@/components/Layout";
import { Section } from "@/components/SectionComponents";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BlogManagement } from "@/components/admin/BlogManagement";
import { TestimonialManagement } from "@/components/admin/TestimonialManagement";
import { FileUploadService } from "@/lib/uploadService";
import {
  Users, FileText, MessageSquare, GraduationCap, ChevronRight, Mail,
  Check, X, Plus, Trash2, Edit, Star, UserCheck,
  Hash, Megaphone, Calendar, FolderOpen, Shield, Bell, Briefcase,
  Settings, Upload, Download, Eye, Image, Video, File, HardDrive
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: string;
  cohort_id?: string;
  is_admin_only: boolean;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  created_by: string;
  created_at: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
  posted_by: string;
  created_at: string;
}

interface Profile {
  user_id: string;
  display_name: string;
  approved: boolean;
  created_at: string;
  user_roles?: { role: string }[];
}

interface ContactMessage {
  id: string;
  subject: string;
  email: string;
  name: string;
  message: string;
  created_at: string;
}

type Tab = "overview" | "blog" | "messages" | "testimonies" | "community";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (loading) return <Layout><Section><p>Loading...</p></Section></Layout>;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "blog", label: "Blog", icon: FileText },
    { id: "messages", label: "Contacts", icon: Mail },
    { id: "testimonies", label: "Testimonials", icon: Star },
    { id: "community", label: "Community", icon: UserCheck },
  ];

  return (
    <Layout>
      <Section>
        <h1 className="font-display text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-4 w-4 mr-1" />
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewPanel />}
        {activeTab === "blog" && <BlogPanel />}
        {activeTab === "messages" && <MessagesPanel />}
        {activeTab === "testimonies" && <TestimoniesPanel />}
        {activeTab === "community" && <CommunityPanel />}
      </Section>
    </Layout>
  );
}

// STUDENTS & COHORTS ARE MANAGED STRICTLY VIA SUPABASE.
// DO NOT REINTRODUCE ADMIN UI OR LOGIC FOR THEM.

// ===== OVERVIEW =====
function OverviewPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminOverviewStats'],
    queryFn: async () => {
      const source = await getTestimonialSource();
      const [communityMembers, messages, blogs, testimonies, pending, channels, events, resources] = await Promise.all([
        supabase.from("community_members").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from(source).select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("approved", false),
        supabase.from("channels").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("resources").select("id", { count: "exact", head: true }),
      ]);

      return {
        communityMembers: communityMembers.count ?? 0,
        messages: messages.count ?? 0,
        blogs: blogs.count ?? 0,
        testimonies: testimonies.count ?? 0,
        pendingApprovals: pending.count ?? 0,
        channels: channels.count ?? 0,
        events: events.count ?? 0,
        resources: resources.count ?? 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const stats = data || {};

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-6 border border-border animate-pulse">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10"></div>
              <div className="h-4 bg-muted rounded w-20"></div>
            </div>
            <div className="h-8 bg-muted rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Community Members", value: stats.communityMembers ?? 0, icon: Users },
    { label: "Channels", value: stats.channels ?? 0, icon: Hash },
    { label: "Events", value: stats.events ?? 0, icon: Calendar },
    { label: "Resources", value: stats.resources ?? 0, icon: FolderOpen },
    { label: "Blog Posts", value: stats.blogs ?? 0, icon: FileText },
    { label: "Contact Messages", value: stats.messages ?? 0, icon: Mail },
    { label: "Testimonies", value: stats.testimonies ?? 0, icon: Star },
    { label: "Pending Approvals", value: stats.pendingApprovals ?? 0, icon: UserCheck },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <card.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">{card.label}</span>
          </div>
          <div className="font-display text-3xl font-bold">{card.value}</div>
        </div>
      ))}
    </div>
  );
}

// ===== BLOG =====
function BlogPanel() {
  return <BlogManagement />;
}

// ===== MESSAGES =====
function MessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  useEffect(() => {
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setMessages(data as ContactMessage[]); });
  }, []);
  return (
    <div className="space-y-4">
      {messages.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
      {messages.map(m => (
        <div key={m.id} className="bg-card rounded-xl p-6 border border-border">
          <div className="flex justify-between items-start mb-2"><h3 className="font-semibold">{m.subject}</h3><span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span></div>
          <p className="text-sm text-muted-foreground mb-2">From: {m.name} ({m.email})</p>
          <p className="text-sm">{m.message}</p>
        </div>
      ))}
    </div>
  );
}

// ===== TESTIMONIES =====
function TestimoniesPanel() {
  return <TestimonialManagement />;
}

// ===== COMMUNITY (Member Management & Roles) =====
function CommunityPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [targetUserId, setTargetUserId] = useState<string>("");
  const { toast } = useToast();

  const fetchProfiles = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .order("created_at", { ascending: false });
    if (data) {
      setProfiles(data as Profile[]);
      // Build user roles map
      const rolesMap: Record<string, string[]> = {};
      data.forEach(profile => {
        rolesMap[profile.user_id] = profile.user_roles?.map(r => r.role) || [];
      });
      setUserRoles(rolesMap);
    }
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const toggleApproval = async (userId: string, currentApproved: boolean) => {
    const { error } = await supabase.from("profiles").update({ approved: !currentApproved }).eq("user_id", userId);
    if (!error) {
      setProfiles(profiles.map(p => p.user_id === userId ? { ...p, approved: !currentApproved } : p));
      toast({ title: currentApproved ? "Community access revoked" : "User approved for community access" });
    }
  };

  const assignRole = async (userId: string, role: string) => {
    try {
      // Check if role already exists
      const existingRoles = userRoles[userId] || [];
      if (existingRoles.includes(role)) {
        // Remove role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);
        if (error) throw error;
        setUserRoles(prev => ({
          ...prev,
          [userId]: prev[userId]?.filter(r => r !== role) || []
        }));
        toast({ title: `Removed ${role} role` });
      } else {
        // Add role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });
        if (error) throw error;
        setUserRoles(prev => ({
          ...prev,
          [userId]: [...(prev[userId] || []), role]
        }));
        toast({ title: `Assigned ${role} role` });
      }
      fetchProfiles(); // Refresh data
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-700";
      case "community_leader": return "bg-blue-100 text-blue-700";
      case "member": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <p className="text-sm text-muted-foreground">
          Manage community members, approve access, and assign roles (admin, community_leader, member).
        </p>
      </div>

      {/* Role Assignment Section */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <h3 className="font-semibold">Assign Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={targetUserId}
            onChange={e => setTargetUserId(e.target.value)}
          >
            <option value="">Select User</option>
            {profiles.map(p => (
              <option key={p.user_id} value={p.user_id}>
                {p.display_name || "Unnamed User"}
              </option>
            ))}
          </select>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="community_leader">Community Leader</option>
            <option value="member">Member</option>
          </select>
          <Button
            onClick={() => targetUserId && selectedRole && assignRole(targetUserId, selectedRole)}
            disabled={!targetUserId || !selectedRole}
            size="sm"
          >
            Assign Role
          </Button>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        <h3 className="font-semibold">Community Members ({profiles.length})</h3>
        {profiles.length === 0 && <p className="text-muted-foreground">No registered users yet.</p>}
        {profiles.map(p => {
          const userRolesList = userRoles[p.user_id] || [];
          return (
            <div key={p.id} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{p.display_name || "Unnamed User"}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${p.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {p.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Joined: {new Date(p.created_at).toLocaleDateString()}
                  </p>
                  {userRolesList.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {userRolesList.map(role => (
                        <span key={role} className={`text-xs px-2 py-1 rounded ${getRoleBadgeColor(role)}`}>
                          {role.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {!p.approved && (
                    <Button size="sm" variant="default" onClick={() => toggleApproval(p.user_id, p.approved)}>
                      Approve Access
                    </Button>
                  )}
                  {p.approved && (
                    <Button size="sm" variant="outline" onClick={() => toggleApproval(p.user_id, p.approved)}>
                      Revoke Access
                    </Button>
                  )}
                  <div className="flex gap-1">
                    {!userRolesList.includes("admin") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => assignRole(p.user_id, "admin")}
                        className="text-xs"
                      >
                        Make Admin
                      </Button>
                    )}
                    {!userRolesList.includes("community_leader") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => assignRole(p.user_id, "community_leader")}
                        className="text-xs"
                      >
                        Make Leader
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== EVENTS =====
function EventsPanel() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState({ title: "", description: "", type: "webinar", date: "", location: "", recording_url: "" });
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase.from("events").select("*").order("date", { ascending: false });
    if (data) setEvents(data as Event[]);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleCreate = async () => {
    if (!form.title || !form.date || !user) return;
    await supabase.from("events").insert({ ...form, date: form.date, location: form.location || null, recording_url: form.recording_url || null, created_by: user.id });
    toast({ title: "Event created" });
    setForm({ title: "", description: "", type: "webinar", date: "", location: "", recording_url: "" });
    fetchEvents();
  };
  const deleteEvent = async (id: string) => { await supabase.from("events").delete().eq("id", id); toast({ title: "Event deleted" }); fetchEvents(); };
  const updateRecording = async (id: string, url: string) => { await supabase.from("events").update({ recording_url: url }).eq("id", id); toast({ title: "Recording updated" }); fetchEvents(); };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <h3 className="font-semibold">Create Event</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="webinar">Webinar</option><option value="bootcamp">Bootcamp</option><option value="mentorship">Mentorship</option><option value="workshop">Workshop</option>
          </select>
          <Input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <Input placeholder="Location (optional)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        </div>
        <Textarea placeholder="Description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
        <Button onClick={handleCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Create Event</Button>
      </div>
      {events.map(e => (
        <div key={e.id} className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-semibold">{e.title}</h4>
              <p className="text-sm text-muted-foreground">{e.type} · {new Date(e.date).toLocaleString()} {e.location && `· ${e.location}`}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => deleteEvent(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Input placeholder="Recording URL" defaultValue={e.recording_url || ""} onBlur={ev => { if (ev.target.value !== (e.recording_url || "")) updateRecording(e.id, ev.target.value); }} className="text-xs h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}





