import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Megaphone, Hash, Paperclip, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: string;
  is_admin_only: boolean;
  cohort_id: string | null;
  created_at: string;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  channel_id: string;
  created_at: string;
  file_url?: string;
  file_name?: string;
}

interface Profile {
  user_id: string;
  display_name: string | null;
  avatar_url?: string;
}

interface Props {
  channelId: string;
  onViewProfile: (userId: string) => void;
}

export function ChannelView({ channelId, onViewProfile }: Props) {
  const { user, isAdmin } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({});

  useEffect(() => {
    if (!channelId) return;
    
    supabase.from("channels").select("*").eq("id", channelId).single().then(({ data }) => {
      if (data) setChannel(data);
    });

    const loadMessages = async () => {
      const { data: msgs } = await supabase.from("messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (msgs) {
        setMessages(msgs);
        const userIds = [...new Set(msgs.map(m => m.user_id))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase.from("profiles")
            .select("user_id, display_name, avatar_url")
            .in("user_id", userIds);
          if (profiles) {
            const map: Record<string, Profile> = {};
            profiles.forEach(p => { map[p.user_id] = p; });
            setProfileMap(map);
          }
        }
      }
    };
    loadMessages();

    const sub = supabase.channel(`channel-${channelId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `channel_id=eq.${channelId}`,
      }, async (payload) => {
        const newMsg = payload.new as Message;
        // Fetch profile if not cached
        if (!profileMap[newMsg.user_id]) {
          const { data: profile } = await supabase.from("profiles")
            .select("user_id, display_name, avatar_url")
            .eq("user_id", newMsg.user_id)
            .single();
          if (profile) setProfileMap(prev => ({ ...prev, [profile.user_id]: profile }));
        }
        setMessages(prev => [...prev, newMsg]);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [channelId, profileMap]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const canPost = channel?.is_admin_only ? isAdmin : true;

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      channel_id: channelId,
      user_id: user.id,
      content: newMessage,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setNewMessage("");
    setSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    const ext = file.name.split('.').pop();
    const path = `${channelId}/${Date.now()}.${ext}`;
    
    const { data, error } = await supabase.storage.from("community-files").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    
    const { data: urlData } = supabase.storage.from("community-files").getPublicUrl(path);
    
    await supabase.from("messages").insert({
      channel_id: channelId,
      user_id: user.id,
      content: `📎 [${file.name}](${urlData.publicUrl})`,
      file_url: urlData.publicUrl,
    });
  };

  const isAnnouncement = channel?.type === "announcement";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-card">
        {isAnnouncement ? <Megaphone className="h-5 w-5 text-primary" /> : <Hash className="h-5 w-5 text-muted-foreground" />}
        <div>
          <h2 className="font-semibold text-sm">{channel?.name ?? "Channel"}</h2>
          {channel?.description && <p className="text-xs text-muted-foreground">{channel.description}</p>}
        </div>
        {isAnnouncement && (
          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Admin Only</span>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => {
          const prof = profileMap[m.user_id];
          return (
          <div key={m.id} className="flex gap-3 group">
            <button 
              onClick={() => m.user_id && onViewProfile(m.user_id)}
              className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 hover:ring-2 hover:ring-primary/30 transition"
            >
              {prof?.avatar_url ? (
                <img src={prof.avatar_url} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">
                  {(prof?.display_name ?? "U").charAt(0).toUpperCase()}
                </span>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <button 
                  onClick={() => m.user_id && onViewProfile(m.user_id)}
                  className="text-sm font-semibold hover:text-primary transition"
                >
                  {prof?.display_name ?? "User"}
                </button>
                <span className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {m.file_url ? (
                <div>
                  {m.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img src={m.file_url} alt="" className="max-w-xs rounded-lg mt-1 border border-border" />
                  ) : (
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                      <Paperclip className="h-3 w-3" /> {m.content.replace(/📎\s*/, '').replace(/\[|\]|\(.*\)/g, '')}
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
              )}
            </div>
          </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-muted-foreground text-center py-10 text-sm">No messages yet. Start the conversation!</p>
        )}
      </div>

      {/* Input */}
      {canPost ? (
        <div className="border-t border-border p-3 flex gap-2 bg-card">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder={isAnnouncement ? "Post an announcement..." : "Type a message..."}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon" disabled={sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-t border-border p-3 bg-muted text-center">
          <p className="text-xs text-muted-foreground">Only admins can post in this channel. You can reply to announcements.</p>
        </div>
      )}
    </div>
  );
}
