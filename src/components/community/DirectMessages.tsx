import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, MessageSquare, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  user_id: string;
  display_name: string | null;
  last_message: string;
  last_message_time: string;
}

interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  file_url?: string;
  file_name?: string;
}

interface Props {
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

export function DirectMessages({ selectedUserId, onSelectUser, onViewProfile }: Props) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch conversation list (unique users we've messaged)
  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      // Get all DMs involving the current user
      const { data: dms } = await supabase.from("direct_messages")
        .select("sender_id, receiver_id, content, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!dms) return;

      // Get unique user IDs
      const userIds = new Set<string>();
      dms.forEach(dm => {
        const otherId = dm.sender_id === user.id ? dm.receiver_id : dm.sender_id;
        userIds.add(otherId);
      });

      // Fetch profiles
      const { data: profiles } = await supabase.from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", Array.from(userIds));

      const convos = Array.from(userIds).map(uid => {
        const lastMsg = dms.find(dm => dm.sender_id === uid || dm.receiver_id === uid);
        const profile = profiles?.find(p => p.user_id === uid);
        return { userId: uid, profile, lastMessage: lastMsg };
      });

      setConversations(convos);
    };
    fetchConversations();

    // Realtime DMs
    const sub = supabase.channel("my-dms")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "direct_messages",
      }, (payload) => {
        const msg = payload.new as DirectMessage;
        if (msg.sender_id === user.id || msg.receiver_id === user.id) {
          if (selectedUserId && (msg.sender_id === selectedUserId || msg.receiver_id === selectedUserId)) {
            setMessages(prev => [...prev, msg]);
          }
          fetchConversations();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [user, selectedUserId]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedUserId || !user) return;
    
    supabase.from("direct_messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUserId}),and(sender_id.eq.${selectedUserId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => { if (data) setMessages(data); });
  }, [selectedUserId, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedUserId) return;
    await supabase.from("direct_messages").insert({
      sender_id: user.id,
      receiver_id: selectedUserId,
      content: newMessage,
    });
    setNewMessage("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedUserId) return;
    const ext = file.name.split('.').pop();
    const path = `dm/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("community-files").upload(path, file);
    if (error) { toast({ title: "Upload failed", variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("community-files").getPublicUrl(path);
    await supabase.from("direct_messages").insert({
      sender_id: user.id, receiver_id: selectedUserId,
      content: `📎 ${file.name}`, file_url: urlData.publicUrl,
    });
  };

  const selectedProfile = conversations.find(c => c.userId === selectedUserId)?.profile;

  return (
    <div className="flex h-full">
      {/* Conversations list */}
      <div className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm mb-2">Direct Messages</h3>
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 h-8 text-xs"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations
            .filter(c => !searchTerm || c.profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(c => (
            <button
              key={c.userId}
              onClick={() => onSelectUser(c.userId)}
              className={`w-full text-left px-3 py-2.5 flex items-center gap-2 border-b border-border/50 transition-colors ${
                selectedUserId === c.userId ? "bg-primary/10" : "hover:bg-muted"
              }`}
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {c.profile?.avatar_url ? (
                  <img src={c.profile.avatar_url} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-primary">
                    {(c.profile?.display_name ?? "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.profile?.display_name ?? "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{c.lastMessage?.content}</p>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6 px-3">No conversations yet. Visit the Directory to connect with members.</p>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-2">
              <button onClick={() => onViewProfile(selectedUserId)} className="flex items-center gap-2 hover:text-primary transition">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {selectedProfile?.avatar_url ? (
                    <img src={selectedProfile.avatar_url} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-primary">
                      {(selectedProfile?.display_name ?? "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-sm">{selectedProfile?.display_name ?? "User"}</span>
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                    m.sender_id === user?.id 
                      ? "bg-primary text-primary-foreground rounded-br-md" 
                      : "bg-muted rounded-bl-md"
                  }`}>
                    {m.file_url ? (
                      m.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img src={m.file_url} alt="" className="max-w-full rounded-lg" />
                      ) : (
                        <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-1">
                          <Paperclip className="h-3 w-3" /> {m.content.replace("📎 ", "")}
                        </a>
                      )
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                    <p className={`text-[10px] mt-1 ${m.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-3 flex gap-2 bg-card">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage} size="icon"><Send className="h-4 w-4" /></Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a conversation or find members in the Directory</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
