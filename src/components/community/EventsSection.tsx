import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Video, Clock, Users, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  end_date?: string;
  location?: string;
  recording_url?: string;
  created_by: string;
  created_at: string;
}

const EVENT_TYPES = ["webinar", "bootcamp", "mentorship", "workshop"];

export function EventsSection() {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "webinar", date: "", end_date: "", location: "", recording_url: "" });
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase.from("events").select("*").order("date", { ascending: true });
    if (data) setEvents(data);
    if (user) {
      const { data: regs } = await supabase.from("event_registrations").select("event_id").eq("user_id", user.id);
      if (regs) setRegistrations(regs.map(r => r.event_id));
    }
  }, [user]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleCreate = async () => {
    if (!form.title || !form.date || !user) return;
    const { error } = await supabase.from("events").insert({
      title: form.title, description: form.description, type: form.type,
      date: form.date, end_date: form.end_date || null, location: form.location || null,
      recording_url: form.recording_url || null, created_by: user.id,
    });
    if (!error) {
      toast({ title: "Event created!" });
      setForm({ title: "", description: "", type: "webinar", date: "", end_date: "", location: "", recording_url: "" });
      setShowForm(false);
      fetchEvents();
    }
  };

  const toggleRegistration = async (eventId: string) => {
    if (!user) return;
    if (registrations.includes(eventId)) {
      await supabase.from("event_registrations").delete().eq("event_id", eventId).eq("user_id", user.id);
      setRegistrations(registrations.filter(id => id !== eventId));
      toast({ title: "Unregistered from event" });
    } else {
      await supabase.from("event_registrations").insert({ event_id: eventId, user_id: user.id });
      setRegistrations([...registrations, eventId]);
      toast({ title: "Registered for event!" });
    }
  };

  const upcoming = events.filter(e => new Date(e.date) >= new Date());
  const past = events.filter(e => new Date(e.date) < new Date());

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Events & Workshops</h2>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> Create Event
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <Input placeholder="Event title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <Input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Input placeholder="Location (optional)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <Input placeholder="Recording URL (optional)" value={form.recording_url} onChange={e => setForm({ ...form, recording_url: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate}>Create Event</Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Upcoming</h3>
          <div className="space-y-3">
            {upcoming.map(e => (
              <div key={e.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{new Date(e.date).toLocaleDateString([], { month: 'short' })}</span>
                      <span className="text-lg font-bold text-primary leading-none">{new Date(e.date).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{e.title}</h4>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">{e.type}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {e.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>}
                      </div>
                      {e.description && <p className="text-sm text-muted-foreground mt-2">{e.description}</p>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={registrations.includes(e.id) ? "outline" : "default"}
                    onClick={() => toggleRegistration(e.id)}
                  >
                    {registrations.includes(e.id) ? <><Check className="h-4 w-4 mr-1" /> Registered</> : "Register"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Past Events</h3>
          <div className="space-y-3">
            {past.map(e => (
              <div key={e.id} className="bg-card rounded-xl border border-border p-4 opacity-75">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">{new Date(e.date).toLocaleDateString([], { month: 'short' })}</span>
                    <span className="text-lg font-bold text-muted-foreground leading-none">{new Date(e.date).getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{e.title}</h4>
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{e.type}</span>
                  </div>
                  {e.recording_url && (
                    <a href={e.recording_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost"><Video className="h-4 w-4 mr-1" /> Recording</Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <p className="text-muted-foreground text-center py-10">No events yet.</p>
      )}
    </div>
  );
}
