import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getTestimonialSource } from "@/lib/testimonials";
import { Layout } from "@/components/Layout";
import { Section } from "@/components/SectionComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BlogManagement } from "@/components/admin/BlogManagement";
import { TestimonialManagement } from "@/components/admin/TestimonialManagement";
import { FileUploadService } from "@/lib/uploadService";
import {
  Users, FileText, MessageSquare, GraduationCap, BookOpen, Mail,
  Check, X, Plus, Trash2, Edit, Star, UserCheck, Link as LinkIcon, Save,
  Hash, Megaphone, Calendar, FolderOpen, Shield, Bell, Briefcase,
  Settings, Upload, Download, Eye, Image, Video, File, HardDrive
} from "lucide-react";

interface DSSApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  program: string;
  year: string;
  status: string;
  created_at: string;
  age?: string;
  education?: string;
  skill_interest?: string;
  city?: string;
  motivation?: string;
}

interface Cohort {
  id: string;
  name: string;
  year: number;
  description?: string;
  banner_url?: string;
  created_at: string;
}

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

interface Student {
  id: string;
  full_name: string;
  email: string;
  skill?: string;
  district: string;
  cohort_id?: string;
  avatar_url?: string;
  approved: boolean;
  created_at?: string;
  cohorts?: { name: string };
}

interface ContactMessage {
  id: string;
  subject: string;
  email: string;
  name: string;
  message: string;
  created_at: string;
}

interface MarketApplication {
  id: string;
  startup_name: string;
  founder_name: string;
  email: string;
  website?: string;
  description?: string;
  logo_url?: string;
  created_at?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  created_at: string;
}

type Tab = "overview" | "cohorts" | "students" | "blog" | "messages" | "testimonies" | "applications" | "community" | "settings" | "team";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (loading) return <Layout><Section><p>Loading...</p></Section></Layout>;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "cohorts", label: "Cohorts", icon: BookOpen },
    { id: "students", label: "Students", icon: Users },
    { id: "blog", label: "Blog", icon: FileText },
    { id: "messages", label: "Contacts", icon: Mail },
    { id: "testimonies", label: "Testimonials", icon: Star },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "team", label: "Team", icon: Users },
    { id: "community", label: "Community", icon: UserCheck },
    { id: "settings", label: "Settings", icon: LinkIcon },
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
        {activeTab === "cohorts" && <CohortsPanel />}
        {activeTab === "students" && <StudentsPanel />}
        {activeTab === "blog" && <BlogPanel />}
        {activeTab === "messages" && <MessagesPanel />}
        {activeTab === "testimonies" && <TestimoniesPanel />}
        {activeTab === "applications" && <ApplicationsPanel />}
        {activeTab === "team" && <TeamPanel />}
        {activeTab === "community" && <CommunityPanel />}
        {activeTab === "settings" && <SettingsPanel />}
      </Section>
    </Layout>
  );
}

// ===== OVERVIEW =====
function OverviewPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminOverviewStats'],
    queryFn: async () => {
      const source = await getTestimonialSource();
      const [apps, communityMembers, cohorts, messages, blogs, testimonies, pending, channels, events, resources] = await Promise.all([
        supabase.from("dss_applications").select("id", { count: "exact", head: true }),
        supabase.from("community_members").select("id", { count: "exact", head: true }),
        supabase.from("cohorts").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from(source).select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("approved", false),
        supabase.from("channels").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("resources").select("id", { count: "exact", head: true }),
      ]);

      return {
        applications: apps.count ?? 0,
        students: communityMembers.count ?? 0,
        cohorts: cohorts.count ?? 0,
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
        {Array.from({ length: 10 }).map((_, i) => (
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
    { label: "DSS Applications", value: stats.applications ?? 0, icon: GraduationCap },
    { label: "Students", value: stats.students ?? 0, icon: Users },
    { label: "Cohorts", value: stats.cohorts ?? 0, icon: BookOpen },
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

// ===== COHORTS =====
function CohortsPanel() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [district, setDistrict] = useState("");
  const [desc, setDesc] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchCohorts = useCallback(async () => {
    const { data } = await supabase.from("cohorts").select("id, name, year, description, banner_url, created_at").order("year", { ascending: false });
    if (data) setCohorts(data as Cohort[]);
  }, []);

  useEffect(() => { fetchCohorts(); }, [fetchCohorts]);

  const generateCohortName = (year: number, district: string) => {
    return `Cohort ${year} - ${district}`;
  };

  const addCohort = async () => {
    if (!district || !year) {
      toast({ title: "Error", description: "Please provide district and year.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const cohortName = generateCohortName(year, district);
    let imageUrl = "";

    if (imageFile) {
      try {
        imageUrl = await FileUploadService.uploadFile(imageFile, "community-media/cohorts/");
      } catch (error) {
        toast({ title: "Upload Error", description: "Failed to upload image.", variant: "destructive" });
        setUploading(false);
        return;
      }
    }

    const cohortData: Partial<Cohort> = {
      name: cohortName,
      year,
      description: desc,
      banner_url: imageUrl || undefined,
    };

    try {
      const { data, error } = await supabase.from("cohorts").insert(cohortData).select().single();
      if (error) throw error;
      if (data) {
        setCohorts([data, ...cohorts]);
        setDistrict("");
        setDesc("");
        setImageFile(null);
        toast({ title: "Cohort created successfully" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
    setUploading(false);
  };

  const updateCohort = async () => {
    if (!editingCohort || !district || !year) return;

    setUploading(true);
    const cohortName = generateCohortName(year, district);
    let imageUrl = editingCohort.image_url || "";

    if (imageFile) {
      try {
        imageUrl = await FileUploadService.uploadFile(imageFile, "community-media/cohorts/");
      } catch (error) {
        toast({ title: "Upload Error", description: "Failed to upload image.", variant: "destructive" });
        setUploading(false);
        return;
      }
    }

    const updateData: Partial<Cohort> = {
      name: cohortName,
      year,
      description: desc,
      banner_url: imageUrl || undefined,
    };

    try {
      const { error } = await supabase.from("cohorts").update(updateData).eq("id", editingCohort.id);
      if (error) throw error;
      toast({ title: "Cohort updated successfully" });
      setEditingCohort(null);
      setDistrict("");
      setDesc("");
      setImageFile(null);
      fetchCohorts();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
    setUploading(false);
  };

  const deleteCohort = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cohort?")) return;
    await supabase.from("cohorts").delete().eq("id", id);
    setCohorts(cohorts.filter(c => c.id !== id));
    toast({ title: "Cohort deleted" });
  };

  const startEdit = (cohort: Cohort) => {
    setEditingCohort(cohort);
    // Extract district from name (format: "Cohort 2024 - District Name")
    const nameParts = cohort.name.split(" - ");
    if (nameParts.length >= 2) {
      setDistrict(nameParts[1]);
    }
    setYear(cohort.year);
    setDesc(cohort.description || "");
  };

  const cancelEdit = () => {
    setEditingCohort(null);
    setDistrict("");
    setYear(new Date().getFullYear());
    setDesc("");
    setImageFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <h3 className="font-semibold">{editingCohort ? "Edit Cohort" : "Add New Cohort"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">District</label>
            <Input
              placeholder="e.g., Nairobi, Kisumu, Mombasa"
              value={district}
              onChange={e => setDistrict(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Year</label>
            <Input
              type="number"
              placeholder="Year"
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            placeholder="Cohort description..."
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Cohort Image (optional)</label>
          <Input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={editingCohort ? updateCohort : addCohort}
            size="sm"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : editingCohort ? "Update Cohort" : "Add Cohort"}
          </Button>
          {editingCohort && (
            <Button onClick={cancelEdit} variant="outline" size="sm">
              Cancel
            </Button>
          )}
        </div>
        {!editingCohort && (
          <p className="text-xs text-muted-foreground">
            Cohort name will be auto-generated as "Cohort [Year] - [District]"
          </p>
        )}
      </div>

      <div className="space-y-4">
        {cohorts.map(c => (
          <div key={c.id} className="bg-card rounded-xl p-4 border border-border cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate(`/cohort/${c.id}`)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {c.banner_url && (
                    <img src={c.banner_url} alt={c.name} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <h4 className="font-semibold">{c.name}</h4>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="outline" onClick={() => startEdit(c)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteCohort(c.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {cohorts.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No cohorts created yet.</p>
        )}
      </div>
    </div>
  );
}

// ===== STUDENTS =====
function StudentsPanel() {
  const [students, setStudents] = useState<Student[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [skill, setSkill] = useState("");
  const [district, setDistrict] = useState("");
  const [cohortId, setCohortId] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    const { data } = await supabase.from("community_members").select("*, cohorts(name)").order("created_at", { ascending: false });
    if (data) setStudents(data as Student[]);
  }, []);

  const fetchCohorts = useCallback(async () => {
    const { data } = await supabase.from("cohorts").select("*");
    if (data) setCohorts(data as Cohort[]);
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchCohorts();
  }, [fetchStudents, fetchCohorts]);

  const addStudent = async () => {
    if (!fullName || !email || !district) {
      toast({ title: "Error", description: "Full name, email and district are required.", variant: "destructive" });
      return;
    }

    setUploading(true);
    let avatarUrl = "";

    if (avatarFile) {
      try {
        avatarUrl = await FileUploadService.uploadFile(avatarFile, "community-media/avatars/");
      } catch (error) {
        toast({ title: "Upload Error", description: "Failed to upload avatar.", variant: "destructive" });
        setUploading(false);
        return;
      }
    }

    const studentData: Partial<Student> = {
      full_name: fullName,
      email,
      skill: skill || null,
      district,
      cohort_id: cohortId || null,
      avatar_url: avatarUrl || null,
      approved: true,
    };

    try {
      const { data, error } = await supabase.from("community_members").insert(studentData).select("*, cohorts(name)").single();
      if (error) throw error;
      if (data) {
        setStudents([data, ...students]);
        resetForm();
        toast({ title: "Student added successfully" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
    setUploading(false);
  };

  const updateStudent = async () => {
    if (!editingStudent || !fullName || !email || !district) return;

    setUploading(true);
    let avatarUrl = editingStudent.avatar_url || "";

    if (avatarFile) {
      try {
        avatarUrl = await FileUploadService.uploadFile(avatarFile, "community-media/avatars/");
      } catch (error) {
        toast({ title: "Upload Error", description: "Failed to upload avatar.", variant: "destructive" });
        setUploading(false);
        return;
      }
    }

    const updateData = {
      full_name: fullName,
      email,
      skill: skill || null,
      district,
      cohort_id: cohortId || null,
      avatar_url: avatarUrl || null,
    };

    try {
      const { error } = await supabase.from("community_members").update(updateData).eq("id", editingStudent.id);
      if (error) throw error;
      toast({ title: "Student updated successfully" });
      setEditingStudent(null);
      resetForm();
      fetchStudents();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
    setUploading(false);
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    await supabase.from("community_members").delete().eq("id", id);
    setStudents(students.filter(s => s.id !== id));
    toast({ title: "Student deleted" });
  };

  const startEdit = (student: Student) => {
    setEditingStudent(student);
    setFullName(student.full_name || "");
    setEmail(student.email || "");
    setSkill(student.skill || "");
    setDistrict(student.district || "");
    setCohortId(student.cohort_id || "");
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setSkill("");
    setDistrict("");
    setCohortId("");
    setAvatarFile(null);
  };

  const cancelEdit = () => {
    setEditingStudent(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <h3 className="font-semibold">{editingStudent ? "Edit Student" : "Add New Student"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Full Name *"
            value={fullName || ""}
            onChange={e => setFullName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email *"
            value={email || ""}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            placeholder="Skill/Interest"
            value={skill || ""}
            onChange={e => setSkill(e.target.value)}
          />
          <Input
            placeholder="District *"
            value={district || ""}
            onChange={e => setDistrict(e.target.value)}
            required
          />
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={cohortId || ""}
            onChange={e => setCohortId(e.target.value)}
          >
            <option value="">Select Cohort (optional)</option>
            {cohorts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Avatar Image (optional)</label>
          <Input
            type="file"
            accept="image/*"
            onChange={e => setAvatarFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={editingStudent ? updateStudent : addStudent}
            size="sm"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : editingStudent ? "Update Student" : "Add Student"}
          </Button>
          {editingStudent && (
            <Button onClick={cancelEdit} variant="outline" size="sm">
              Cancel
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          * Required fields. Avatars are uploaded to the community-media/avatars/ storage bucket.
        </p>
      </div>

      <div className="space-y-4">
        {students.map(s => (
          <div key={s.id} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {s.avatar_url && (
                  <img src={s.avatar_url} alt={s.full_name} className="w-16 h-16 rounded-full object-cover" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{s.full_name}</h4>
                    {s.cohorts?.name && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {s.cohorts.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{s.email}</p>
                  <p className="text-sm text-muted-foreground mb-1">{s.district}</p>
                  {s.skill && <p className="text-sm text-muted-foreground">Skill: {s.skill}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(s)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteStudent(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No students added yet.</p>
        )}
      </div>
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

// ===== APPLICATIONS =====
function ApplicationsPanel() {
  const [applications, setApplications] = useState<MarketApplication[]>([]);
  const [approving, setApproving] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApplications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("startup_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        toast({ title: "Error", description: "Failed to load applications", variant: "destructive" });
        return;
      }

      setApplications((data || []) as MarketApplication[]);
    } catch (error) {
      console.error("Unexpected error fetching applications:", error);
      toast({ title: "Error", description: "Failed to load applications", variant: "destructive" });
    }
  }, [toast]);

  const approveApplication = async (appId: string, startup: MarketApplication) => {
    if (!startup.logo_url) {
      toast({ title: "Error", description: "Logo is required to approve application", variant: "destructive" });
      return;
    }

    setApproving(appId);

    try {
      const { error: insertError } = await supabase.from("startups").insert({
        name: startup.startup_name,
        logo_url: startup.logo_url,
        website: startup.website || "",
      });

      if (insertError) {
        console.error("Error inserting startup:", insertError);
        toast({ title: "Error", description: "Failed to approve application", variant: "destructive" });
        setApproving(null);
        return;
      }

      toast({ title: "Success", description: "Application approved and added to portfolio" });
      setApplications(applications.filter(app => app.id !== appId));
      setApproving(null);
    } catch (error) {
      console.error("Unexpected error approving application:", error);
      toast({ title: "Error", description: "Failed to approve application", variant: "destructive" });
      setApproving(null);
    }
  };

  const rejectApplication = async (appId: string) => {
    if (!confirm("Are you sure you want to reject this application?")) return;

    try {
      const { error } = await supabase.from("startup_applications").delete().eq("id", appId);

      if (error) {
        console.error("Error rejecting application:", error);
        toast({ title: "Error", description: "Failed to reject application", variant: "destructive" });
        return;
      }

      toast({ title: "Application rejected" });
      setApplications(applications.filter(app => app.id !== appId));
    } catch (error) {
      console.error("Unexpected error rejecting application:", error);
      toast({ title: "Error", description: "Failed to reject application", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <p className="text-sm text-muted-foreground">
          Review and approve startup applications to add them to the portfolio.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Pending Applications ({applications.length})</h3>
        {applications.length === 0 && <p className="text-muted-foreground">No pending applications.</p>}
        {applications.map(app => (
          <div key={app.id} className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {app.logo_url && (
                  <img
                    src={app.logo_url}
                    alt="Logo"
                    className="h-16 w-16 object-cover rounded mb-4"
                  />
                )}
                <h4 className="font-semibold text-lg mb-2">{app.startup_name}</h4>
                <div className="space-y-1 mb-4">
                  <p className="text-sm"><strong>Founder:</strong> {app.founder_name}</p>
                  <p className="text-sm"><strong>Email:</strong> {app.email}</p>
                  {app.website && (
                    <p className="text-sm"><strong>Website:</strong> <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{app.website}</a></p>
                  )}
                  <p className="text-xs text-muted-foreground"><strong>Submitted:</strong> {new Date(app.created_at).toLocaleString()}</p>
                </div>
                <div className="mb-4 p-3 bg-muted rounded">
                  <p className="text-sm"><strong>Description:</strong></p>
                  <p className="text-sm text-muted-foreground mt-1">{app.description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-max">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => approveApplication(app.id, app)}
                  disabled={approving === app.id}
                >
                  {approving === app.id ? "Approving..." : <><Check className="h-4 w-4 mr-1" /> Approve</>}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => rejectApplication(app.id)}
                  disabled={approving === app.id}
                >
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          </div>
        ))}
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

// ===== SETTINGS =====
function SettingsPanel() {
  const [applicationLink, setApplicationLink] = useState("");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "dss_application_link").maybeSingle();
      if (!error && data?.value) setApplicationLink(data.value);
    };
    load();
  }, []);

  const saveLink = async () => {
    const { data: existing, error } = await supabase.from("site_settings").select("id").eq("key", "dss_application_link").maybeSingle();
    if (error) {
      console.error("Settings load error", error);
      toast({ title: "Error", description: "Unable to save settings.", variant: "destructive" });
      return;
    }

    if (existing) {
      await supabase.from("site_settings").update({ value: applicationLink }).eq("key", "dss_application_link");
    } else {
      await supabase.from("site_settings").insert({ key: "dss_application_link", value: applicationLink });
    }

    toast({ title: "Saved" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <h3 className="font-semibold">DSS Application Form Link</h3>
        <p className="text-sm text-muted-foreground">Set the external application form URL. This is where applicants will be redirected to apply and pay the fee.</p>
        <Input placeholder="https://forms.google.com/..." value={applicationLink} onChange={e => setApplicationLink(e.target.value)} />
        <Button onClick={saveLink} size="sm"><Save className="h-4 w-4 mr-1" /> {saved ? "Saved!" : "Save Link"}</Button>
      </div>
    </div>
  );
}

// ===== TEAM MANAGEMENT =====
function TeamPanel() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchTeamMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to load team members", variant: "destructive" });
      return;
    }

    setTeamMembers(data as TeamMember[]);
  }, [toast]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const handleSubmit = async () => {
    if (!name || !role) {
      toast({ title: "Error", description: "Name and role are required", variant: "destructive" });
      return;
    }

    if (!editingMember && !imageFile) {
      toast({ title: "Error", description: "Image is required for new team members", variant: "destructive" });
      return;
    }

    setUploading(true);
    let imageUrl = editingMember?.image_url || "";

    // Upload image if provided
    if (imageFile) {
      try {
        imageUrl = await FileUploadService.uploadTeamMemberImage(imageFile);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload image";
        toast({ title: "Upload Error", description: message, variant: "destructive" });
        setUploading(false);
        return;
      }
    }

    const memberData = {
      name,
      role,
      bio: bio || null,
      image_url: imageUrl || null,
    };

    try {
      if (editingMember) {
        const { error } = await supabase
          .from("team_members")
          .update(memberData)
          .eq("id", editingMember.id);

        if (error) throw error;
        toast({ title: "Success", description: "Team member updated successfully" });
      } else {
        const { error } = await supabase
          .from("team_members")
          .insert(memberData);

        if (error) throw error;
        toast({ title: "Success", description: "Team member added successfully" });
      }

      setName("");
      setRole("");
      setBio("");
      setImageFile(null);
      setEditingMember(null);
      fetchTeamMembers();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
    setUploading(false);
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Team member deleted" });
      fetchTeamMembers();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const startEdit = (member: TeamMember) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setBio(member.bio || "");
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setName("");
    setRole("");
    setBio("");
    setImageFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <h3 className="font-semibold">{editingMember ? "Edit Team Member" : "Add Team Member"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Role *</label>
            <Input
              placeholder="e.g., Program Manager"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Bio</label>
          <Textarea
            placeholder="Brief description of the team member's role and background..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Profile Image</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {editingMember?.image_url && (
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to keep current image
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={uploading} size="sm">
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            {editingMember ? "Update" : "Add"} Member
          </Button>
          {editingMember && (
            <Button onClick={cancelEdit} variant="outline" size="sm">
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        <h3 className="font-semibold">Current Team Members</h3>
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {member.image_url && (
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold">{member.name}</h4>
                  <p className="text-primary font-medium">{member.role}</p>
                  {member.bio && (
                    <p className="text-sm text-muted-foreground mt-1">{member.bio}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(member)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteMember(member.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {teamMembers.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No team members added yet.</p>
        )}
      </div>
    </div>
  );
}



