import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTestimonialSource, normalizeTestimonialRow, buildTestimonialSelect, clearTestimonialSourceCache } from "@/lib/testimonials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Check, X, Star, Edit, Trash2, AlertTriangle, Database, Video } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string | null;
  photo_url: string | null;
  testimonial_text: string;
  video_url: string | null;
  status: "active" | "hidden";
  is_featured: boolean;
  created_at: string;
}

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Hidden", value: "hidden" },
];

export const TestimonialManagement = () => {
  const emptyTestimonial: Testimonial = {
    id: "",
    name: "",
    role: "",
    organization: null,
    photo_url: null,
    testimonial_text: "",
    video_url: null,
    status: "hidden",
    is_featured: false,
    created_at: new Date().toISOString(),
  };

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "hidden">("all");
  const [loading, setLoading] = useState(true);
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);

    try {
      const source = await getTestimonialSource();
      setMigrationNeeded(source === "testimonies");

      const select = buildTestimonialSelect(source);

      let query = supabase.from(source).select(select).order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to load testimonials:", error);
        // If it's a 404 and we're still trying testimonials, clear cache and retry
        if (error.status === 404 && source === "testimonials") {
          clearTestimonialSourceCache();
          const retrySource = await getTestimonialSource();
          setMigrationNeeded(retrySource === "testimonies");

          if (retrySource !== source) {
            const retrySelect = buildTestimonialSelect(retrySource);
            let retryQuery = supabase.from(retrySource).select(retrySelect).order("created_at", { ascending: false });

            if (filter !== "all") {
              retryQuery = retryQuery.eq("status", filter);
            }

            const { data: retryData } = await retryQuery;
            if (retryData) {
              setTestimonials(retryData.map((row: Record<string, unknown>) => normalizeTestimonialRow(row, retrySource)));
            }
          }
        } else {
          toast.error("Failed to load testimonials");
        }
        setLoading(false);
        return;
      }

      setTestimonials((data ?? []).map((row: Record<string, unknown>) => normalizeTestimonialRow(row, source)));
    } catch (err) {
      console.error("Unexpected error loading testimonials:", err);
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const saveTestimonial = async (testimonial: Partial<Testimonial>) => {
    const source = await getTestimonialSource();

    const payload =
      source === "testimonials"
        ? {
            name: testimonial.name?.trim() || "",
            role: testimonial.role || "",
            organization: testimonial.organization?.trim() || null,
            photo_url: testimonial.photo_url || null,
            testimonial_text: testimonial.testimonial_text?.trim() || "",
            video_url: testimonial.video_url?.trim() || null,
            status: testimonial.status || "hidden",
            is_featured: testimonial.is_featured ?? false,
          }
        : {
            name: testimonial.name?.trim() || "",
            role: testimonial.role || "",
            organization: testimonial.organization?.trim() || null,
            image_url: testimonial.photo_url || null,
            testimony: testimonial.testimonial_text?.trim() || "",
            video_url: testimonial.video_url?.trim() || null,
            status: testimonial.status || "hidden",
            approved: testimonial.status === "active",
            featured: testimonial.is_featured ?? false,
          };

    if (!payload.name || !payload.role || !(payload.testimonial_text ?? payload.testimony)) {
      toast.error("Please fill in name, role, and testimonial text.");
      return;
    }

    if (testimonial.id) {
      const { error } = await supabase
        .from(source)
        .update(payload)
        .eq("id", testimonial.id);

      if (error) {
        toast.error("Failed to update testimonial");
        return;
      }

      toast.success("Testimonial updated");
    } else {
      const { error } = await supabase.from(source).insert(payload);
      if (error) {
        toast.error("Failed to create testimonial");
        return;
      }
      toast.success("Testimonial created");
    }

    setIsEditing(false);
    setIsCreating(false);
    setSelectedTestimonial(null);
    fetchTestimonials();
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    const source = await getTestimonialSource();
    const { error } = await supabase.from(source).delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete testimonial");
      return;
    }

    toast.success("Testimonial deleted");
    fetchTestimonials();
    setSelectedTestimonial(null);
  };

  const toggleFeatured = async (testimonial: Testimonial) => {
    const source = await getTestimonialSource();
    const column = source === "testimonials" ? "is_featured" : "featured";

    const { error } = await supabase
      .from(source)
      .update({ [column]: !testimonial.is_featured })
      .eq("id", testimonial.id);

    if (error) {
      toast.error("Failed to update featured status");
      return;
    }

    toast.success(testimonial.is_featured ? "Removed from featured" : "Added to featured");
    fetchTestimonials();
  };

  const toggleStatus = async (testimonial: Testimonial) => {
    const source = await getTestimonialSource();
    const newStatus = testimonial.status === "active" ? "hidden" : "active";
    const payload: Record<string, string | boolean> = { status: newStatus };

    if (source === "testimonies") {
      payload.approved = newStatus === "active";
    }

    const { error } = await supabase
      .from(source)
      .update(payload)
      .eq("id", testimonial.id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    toast.success(`Testimonial ${newStatus}`);
    fetchTestimonials();
  };

  const migrateTestimonials = async () => {
    if (!confirm("This will copy all testimonials from the old table to the new one. Continue?")) return;

    setMigrating(true);
    try {
      // First, check if testimonials table exists
      const { error: checkError } = await supabase.from("testimonials").select("id").limit(1);
      if (checkError?.status === 404) {
        toast.error("New testimonials table doesn't exist. Please run the database migration first.");
        return;
      }

      // Copy data from testimonies to testimonials
      const { data: oldTestimonials, error: fetchError } = await supabase
        .from("testimonies")
        .select("*");

      if (fetchError) {
        toast.error("Failed to fetch old testimonials");
        return;
      }

      if (!oldTestimonials || oldTestimonials.length === 0) {
        toast.success("No testimonials to migrate");
        setMigrationNeeded(false);
        return;
      }

      // Transform and insert
      const newTestimonials = oldTestimonials.map((old: Record<string, unknown>) => ({
        name: old.name,
        role: old.role,
        organization: old.organization,
        photo_url: old.image_url,
        testimonial_text: old.testimony,
        video_url: old.video_url,
        is_featured: old.featured || false,
        status: old.approved ? "active" : "hidden",
        created_at: old.created_at,
      }));

      const { error: insertError } = await supabase
        .from("testimonials")
        .insert(newTestimonials);

      if (insertError) {
        toast.error("Failed to migrate testimonials: " + insertError.message);
        return;
      }

      toast.success(`Successfully migrated ${newTestimonials.length} testimonials!`);
      setMigrationNeeded(false);
      fetchTestimonials();

    } catch (error: unknown) {
      toast.error("Migration failed: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setMigrating(false);
    }
  };

  const activeCount = testimonials.filter((t) => t.status === "active").length;
  const hiddenCount = testimonials.filter((t) => t.status === "hidden").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Testimonials</h2>
          <p className="text-muted-foreground">Manage testimonials shown across the site.</p>
        </div>
        <Button onClick={() => { setSelectedTestimonial(emptyTestimonial); setIsCreating(true); setIsEditing(true); }}>
          Add Testimonial
        </Button>
      </div>

      {migrationNeeded && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Database Migration Needed</AlertTitle>
          <AlertDescription className="text-orange-700">
            You're using the legacy testimonials table. Click below to migrate to the new schema with video support and better admin controls.
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={migrateTestimonials}
                disabled={migrating}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <Database className="w-4 h-4 mr-2" />
                {migrating ? "Migrating..." : "Migrate Testimonials"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "active" | "hidden")}>
        <TabsList>
          <TabsTrigger value="all">All ({testimonials.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="hidden">Hidden ({hiddenCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-6">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">Loading testimonials…</CardContent>
            </Card>
          ) : testimonials.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No testimonials found.
              </CardContent>
            </Card>
          ) : (
            testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <Avatar className="w-16 h-16 flex-shrink-0">
                      <AvatarImage src={testimonial.photo_url || ""} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                            {testimonial.is_featured && (
                              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {testimonial.role && <Badge variant="secondary">{testimonial.role}</Badge>}
                            <Badge
                              variant={testimonial.status === "active" ? "default" : "outline"}
                            >
                              {testimonial.status}
                            </Badge>
                          </div>
                          {testimonial.organization && (
                            <p className="text-sm text-muted-foreground">{testimonial.organization}</p>
                          )}
                        </div>
                      </div>

                      <p className="text-muted-foreground italic line-clamp-3">
                        {testimonial.testimonial_text}
                      </p>

                      {testimonial.video_url && (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Video className="w-4 h-4" />
                          <a href={testimonial.video_url} target="_blank" rel="noopener noreferrer">
                            Video testimonial
                          </a>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          size="sm"
                          variant={testimonial.is_featured ? "outline" : "secondary"}
                          onClick={() => toggleFeatured(testimonial)}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          {testimonial.is_featured ? "Unfeature" : "Feature"}
                        </Button>
                        <Button
                          size="sm"
                          variant={testimonial.status === "active" ? "outline" : "default"}
                          onClick={() => toggleStatus(testimonial)}
                        >
                          {testimonial.status === "active" ? "Hide" : "Publish"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTestimonial(testimonial);
                            setIsEditing(true);
                            setIsCreating(false);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteTestimonial(testimonial.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Add" : "Edit"} Testimonial</DialogTitle>
            <DialogDescription>{
              isCreating
                ? "Add a new testimonial for display on the site."
                : "Update the testimonial details below."
            }</DialogDescription>
          </DialogHeader>
          {(isCreating || selectedTestimonial) && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={selectedTestimonial?.name || ""}
                  onChange={(e) =>
                    setSelectedTestimonial((prev) => ({
                      ...(prev || {
                        id: "",
                        name: "",
                        role: "",
                        organization: null,
                        photo_url: null,
                        testimonial_text: "",
                        video_url: null,
                        is_featured: false,
                        status: "hidden",
                        created_at: new Date().toISOString(),
                      }),
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Role</Label>
                <Select
                  value={selectedTestimonial?.role || ""}
                  onValueChange={(value) =>
                    setSelectedTestimonial((prev) => ({
                      ...(prev || {
                        id: "",
                        name: "",
                        role: "",
                        organization: null,
                        photo_url: null,
                        testimonial_text: "",
                        video_url: null,
                        is_featured: false,
                        status: "hidden",
                        created_at: new Date().toISOString(),
                      }),
                      role: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Partner">Partner</SelectItem>
                    <SelectItem value="Mentor">Mentor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Organization</Label>
                <Input
                  value={selectedTestimonial?.organization || ""}
                  onChange={(e) =>
                    setSelectedTestimonial((prev) => ({
                      ...(prev || {
                        id: "",
                        name: "",
                        role: "",
                        organization: null,
                        photo_url: null,
                        testimonial_text: "",
                        video_url: null,
                        is_featured: false,
                        status: "hidden",
                        created_at: new Date().toISOString(),
                      }),
                      organization: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Photo URL</Label>
                <Input
                  value={selectedTestimonial?.photo_url || ""}
                  onChange={(e) =>
                    setSelectedTestimonial((prev) => ({
                      ...(prev || {
                        id: "",
                        name: "",
                        role: "",
                        organization: null,
                        photo_url: null,
                        testimonial_text: "",
                        video_url: null,
                        is_featured: false,
                        status: "hidden",
                        created_at: new Date().toISOString(),
                      }),
                      photo_url: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Testimonial</Label>
                <Textarea
                  value={selectedTestimonial?.testimonial_text || ""}
                  onChange={(e) =>
                    setSelectedTestimonial((prev) => ({
                      ...(prev || {
                        id: "",
                        name: "",
                        role: "",
                        organization: null,
                        photo_url: null,
                        testimonial_text: "",
                        video_url: null,
                        is_featured: false,
                        status: "hidden",
                        created_at: new Date().toISOString(),
                      }),
                      testimonial_text: e.target.value,
                    }))
                  }
                  rows={6}
                />
              </div>

              <div>
                <Label>Video URL</Label>
                <Input
                  value={selectedTestimonial?.video_url || ""}
                  onChange={(e) =>
                    setSelectedTestimonial((prev) => ({
                      ...(prev || {
                        id: "",
                        name: "",
                        role: "",
                        organization: null,
                        photo_url: null,
                        testimonial_text: "",
                        video_url: null,
                        is_featured: false,
                        status: "hidden",
                        created_at: new Date().toISOString(),
                      }),
                      video_url: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selectedTestimonial?.status || "hidden"}
                    onValueChange={(value) =>
                      setSelectedTestimonial((prev) => ({
                        ...(prev || {
                          id: "",
                          name: "",
                          role: "",
                          organization: null,
                          photo_url: null,
                          testimonial_text: "",
                          video_url: null,
                          is_featured: false,
                          status: "hidden",
                          created_at: new Date().toISOString(),
                        }),
                        status: value as "active" | "hidden",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Featured</Label>
                  <Select
                    value={selectedTestimonial?.is_featured ? "yes" : "no"}
                    onValueChange={(value) =>
                      setSelectedTestimonial((prev) => ({
                        ...(prev || {
                          id: "",
                          name: "",
                          role: "",
                          organization: null,
                          photo_url: null,
                          testimonial_text: "",
                          video_url: null,
                          is_featured: false,
                          status: "hidden",
                          created_at: new Date().toISOString(),
                        }),
                        is_featured: value === "yes",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => selectedTestimonial && saveTestimonial(selectedTestimonial)}
                >
                  {isCreating ? "Create" : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreating(false);
                    setSelectedTestimonial(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
