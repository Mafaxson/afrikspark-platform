import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NormalizedTestimonial, buildTestimonialSelect } from "@/lib/testimonials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X, Star, Edit, Trash2, Video } from "lucide-react";

interface Testimonial extends NormalizedTestimonial {
  status: "pending" | "approved" | "rejected";
}

export const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const select = buildTestimonialSelect("testimonials");
      const { data, error } = await supabase
        .from("testimonials")
        .select(select)
        .order("created_at", { ascending: false });

      if (error) throw error;

      let items = (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: row.name as string,
        role: row.role as string,
        organization: (row.organization as string | null) ?? null,
        photo_url: (row.photo_url as string | null) ?? null,
        testimonial_text: (row.testimonial_text as string) ?? "",
        video_url: (row.video_url as string | null) ?? null,
        is_featured: (row.is_featured as boolean) ?? false,
        status: (row.status as "pending" | "approved" | "rejected") ?? "pending",
        created_at: (row.created_at as string) ?? new Date().toISOString(),
      } as Testimonial));

      if (filter !== "all") {
        items = items.filter(t => t.status === filter);
      }
      setTestimonials(items);
    } catch (err) {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const saveTestimonial = async (testimonial: Partial<Testimonial>) => {
    if (!testimonial.name || !testimonial.role || !testimonial.testimonial_text) {
      toast.error("Please fill in required fields");
      return;
    }

    const payload = {
      name: testimonial.name.trim(),
      role: testimonial.role,
      organization: testimonial.organization?.trim() || null,
      photo_url: testimonial.photo_url || null,
      testimonial_text: testimonial.testimonial_text.trim(),
      video_url: testimonial.video_url?.trim() || null,
      status: testimonial.status || "pending",
      is_featured: testimonial.is_featured ?? false,
    };

    try {
      if (testimonial.id) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", testimonial.id);
        if (error) throw error;
        toast.success("Updated");
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
        toast.success("Created");
      }
      setIsEditing(false);
      setSelectedTestimonial(null);
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Delete?")) return;
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted");
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed");
    }
  };

  const updateStatus = async (id: string, newStatus: "pending" | "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("testimonials").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      toast.success("Status updated");
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed");
    }
  };

  const pending = testimonials.filter((t) => t.status === "pending").length;
  const approved = testimonials.filter((t) => t.status === "approved").length;
  const rejected = testimonials.filter((t) => t.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testimonials</h2>
        </div>
        <Button onClick={() => {
          setSelectedTestimonial({ id: "", name: "", role: "", organization: null, photo_url: null, testimonial_text: "", video_url: null, status: "pending", is_featured: false, created_at: new Date().toISOString() });
          setIsEditing(true);
        }}>Add</Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({testimonials.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : testimonials.length ===0 ? (
            <div className="text-center">No testimonials</div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={t.photo_url || ""} />
                        <AvatarFallback>{t.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex gap-2">
                          <h3 className="font-semibold">{t.name}</h3>
                          {t.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge>{t.role}</Badge>
                          <Badge>{t.status}</Badge>
                        </div>
                        <p className="text-sm mt-2 line-clamp-2">"{t.testimonial_text}"</p>
                        <div className="flex gap-2 mt-3">
                          {t.status !== "approved" && <Button size="sm" onClick={() => updateStatus(t.id, "approved")}><Check className="w-3 h-3 mr-1" />Approve</Button>}
                          {t.status !== "rejected" && <Button size="sm" variant="destructive" onClick={() => updateStatus(t.id, "rejected")}><X className="w-3 h-3 mr-1" />Reject</Button>}
                          <Button size="sm" variant="outline" onClick={() => { setSelectedTestimonial(t); setIsEditing(true); }}><Edit className="w-3 h-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => deleteTestimonial(t.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testimonial</DialogTitle>
          </DialogHeader>
          {selectedTestimonial && (
            <div className="space-y-4">
              <Input placeholder="Name" value={selectedTestimonial.name} onChange={(e) => setSelectedTestimonial({...selectedTestimonial, name: e.target.value})} />
              <Select value={selectedTestimonial.role} onValueChange={(v) => setSelectedTestimonial({...selectedTestimonial, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Client">Client</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Testimonial" value={selectedTestimonial.testimonial_text} onChange={(e) => setSelectedTestimonial({...selectedTestimonial, testimonial_text: e.target.value})} />
              <Input placeholder="Photo URL" value={selectedTestimonial.photo_url || ""} onChange={(e) => setSelectedTestimonial({...selectedTestimonial, photo_url: e.target.value})} />
              <Input placeholder="Video URL" value={selectedTestimonial.video_url || ""} onChange={(e) => setSelectedTestimonial({...selectedTestimonial, video_url: e.target.value})} />
              <Select value={selectedTestimonial.status} onValueChange={(v) => setSelectedTestimonial({...selectedTestimonial, status: v as any})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={() => saveTestimonial(selectedTestimonial)}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
