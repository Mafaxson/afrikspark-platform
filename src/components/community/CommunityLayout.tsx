import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Section } from "@/components/SectionComponents";
import { Navigate } from "react-router-dom";
import { 
  MessageSquare, Hash, Users, Bell, BookOpen, Calendar, 
  FolderOpen, Search, User, Send, Menu, X, Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChannelView } from "./ChannelView";
import { DirectMessages } from "./DirectMessages";
import { MemberDirectory } from "./MemberDirectory";
import { MemberProfile } from "./MemberProfile";
import { Notifications } from "./Notifications";
import { ResourcesHub } from "./ResourcesHub";
import { EventsSection } from "./EventsSection";
import { ProjectsSpace } from "./ProjectsSpace";
import { ConnectionsList } from "./ConnectionsList";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: string;
  is_admin_only: boolean;
  cohort_id: string | null;
  created_at: string;
}

export type CommunityView = 
  | { type: "channel"; channelId: string }
  | { type: "dm"; userId: string }
  | { type: "directory" }
  | { type: "profile"; userId: string }
  | { type: "notifications" }
  | { type: "resources" }
  | { type: "events" }
  | { type: "projects" }
  | { type: "connections" }
  | { type: "my-profile" };

export default function CommunityLayout() {
  const { user, isApproved, isAdmin, loading } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [view, setView] = useState<CommunityView>({ type: "directory" });
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || !isApproved) return;
    
    supabase.from("channels").select("*").order("type").order("name").then(({ data }) => {
      if (data) {
        setChannels(data);
        // Default to announcement channel if exists
        const announcement = data.find(c => c.type === "announcement");
        if (announcement) setView({ type: "channel", channelId: announcement.id });
      }
    }).catch((error) => {
      console.error("Error fetching channels:", error);
    });

    // Fetch unread notifications count
    supabase.from("notifications").select("id", { count: "exact", head: true })
      .eq("user_id", user.id).eq("read", false)
      .then(({ count }) => setUnreadNotifs(count ?? 0)).catch((error) => {
        console.error("Error fetching notifications:", error);
      });

    // Realtime notifications
    const notifChannel = supabase.channel("my-notifs")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, () => setUnreadNotifs(prev => prev + 1))
      .subscribe();

    return () => { supabase.removeChannel(notifChannel); };
  }, [user, isApproved]);

  if (loading) return <Layout><Section><p className="text-muted-foreground">Loading...</p></Section></Layout>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin && !isApproved) {
    return (
      <Layout>
        <Section className="min-h-[60vh] flex items-center">
          <div className="text-center max-w-md mx-auto">
            <MessageSquare className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Awaiting Approval</h1>
            <p className="text-muted-foreground">Your account is pending admin approval. You'll be able to access the community once approved.</p>
          </div>
        </Section>
      </Layout>
    );
  }

  const announcementChannels = channels.filter(c => c.type === "announcement");
  const generalChannels = channels.filter(c => c.type === "general");
  const classChannels = channels.filter(c => c.type === "class");

  const navItems = [
    { icon: Bell, label: "Notifications", badge: unreadNotifs, onClick: () => setView({ type: "notifications" }) },
    { icon: Users, label: "Directory", onClick: () => setView({ type: "directory" }) },
    { icon: User, label: "Connections", onClick: () => setView({ type: "connections" }) },
    { icon: Send, label: "Messages", onClick: () => setView({ type: "dm", userId: "" }) },
    { icon: BookOpen, label: "Resources", onClick: () => setView({ type: "resources" }) },
    { icon: Calendar, label: "Events", onClick: () => setView({ type: "events" }) },
    { icon: FolderOpen, label: "Projects", onClick: () => setView({ type: "projects" }) },
    { icon: User, label: "My Profile", onClick: () => setView({ type: "my-profile" }) },
  ];

  const isActiveChannel = (id: string) => view.type === "channel" && view.channelId === id;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <div className="p-3 space-y-1 border-b border-border">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => { item.onClick(); setSidebarOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
            {item.badge && item.badge > 0 && (
              <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {announcementChannels.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Megaphone className="h-3 w-3" /> Announcements
            </h3>
            {announcementChannels.map(c => (
              <button
                key={c.id}
                onClick={() => { setView({ type: "channel", channelId: c.id }); setSidebarOpen(false); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  isActiveChannel(c.id) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Megaphone className="h-3.5 w-3.5" />
                {c.name}
              </button>
            ))}
          </div>
        )}

        {generalChannels.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Hash className="h-3 w-3" /> General
            </h3>
            {generalChannels.map(c => (
              <button
                key={c.id}
                onClick={() => { setView({ type: "channel", channelId: c.id }); setSidebarOpen(false); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  isActiveChannel(c.id) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Hash className="h-3.5 w-3.5" />
                {c.name}
              </button>
            ))}
          </div>
        )}

        {classChannels.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> Class Channels
            </h3>
            {classChannels.map(c => (
              <button
                key={c.id}
                onClick={() => { setView({ type: "channel", channelId: c.id }); setSidebarOpen(false); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  isActiveChannel(c.id) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Mobile sidebar toggle */}
        <button
          className="md:hidden fixed bottom-4 left-4 z-50 bg-primary text-primary-foreground rounded-full p-3 shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 fixed md:static inset-y-0 left-0 z-40
          w-64 bg-card border-r border-border transition-transform duration-200
        `}>
          {sidebarContent}
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-background/80 z-30" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {view.type === "channel" && <ChannelView channelId={view.channelId} onViewProfile={(uid) => setView({ type: "profile", userId: uid })} />}
          {view.type === "dm" && <DirectMessages selectedUserId={view.userId} onSelectUser={(uid) => setView({ type: "dm", userId: uid })} onViewProfile={(uid) => setView({ type: "profile", userId: uid })} />}
          {view.type === "directory" && <MemberDirectory onViewProfile={(uid) => setView({ type: "profile", userId: uid })} onMessage={(uid) => setView({ type: "dm", userId: uid })} />}
          {view.type === "profile" && <MemberProfile userId={view.userId} onMessage={(uid) => setView({ type: "dm", userId: uid })} />}
          {view.type === "my-profile" && user && <MemberProfile userId={user.id} onMessage={() => {}} isOwnProfile />}
          {view.type === "notifications" && <Notifications />}
          {view.type === "resources" && <ResourcesHub />}
          {view.type === "events" && <EventsSection />}
          {view.type === "projects" && <ProjectsSpace onViewProfile={(uid) => setView({ type: "profile", userId: uid })} />}
          {view.type === "connections" && <ConnectionsList onViewProfile={(uid) => setView({ type: "profile", userId: uid })} onMessage={(uid) => setView({ type: "dm", userId: uid })} />}
        </div>
      </div>
    </Layout>
  );
}
