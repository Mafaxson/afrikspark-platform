import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, UserPlus, ExternalLink, MapPin, GraduationCap, Briefcase, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  user_id: string;
  display_name: string;
  bio?: string;
  location?: string;
  institution?: string;
  career_interest?: string;
  skills?: string[];
  social_links?: Record<string, string>;
  cohort_id?: string;
  avatar_url?: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
  cohorts?: Cohort;
}

interface Cohort {
  name: string;
  year: number;
}

interface ProfileForm {
  display_name: string;
  bio: string;
  location: string;
  institution: string;
  career_interest: string;
  skills: string[];
  social_links: Record<string, string>;
  cohort_id: string;
}

interface Props {
  userId: string;
  onMessage: (userId: string) => void;
  isOwnProfile?: boolean;
}

export function MemberProfile({ userId, onMessage, isOwnProfile }: Props) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    display_name: "",
    bio: "",
    location: "",
    institution: "",
    career_interest: "",
    skills: [],
    social_links: {},
    cohort_id: "",
  });
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    supabase.rpc("get_user_profile", { target_user_id: userId }).then(({ data }) => {
      if (data && data.length > 0) {
        const profileData = data[0] as Profile;
        setProfile(profileData);
        setCohort(profileData.cohorts || null);
        setForm({
          display_name: profileData.display_name || "",
          bio: profileData.bio || "",
          location: profileData.location || "",
          institution: profileData.institution || "",
          career_interest: profileData.career_interest || "",
          skills: profileData.skills || [],
          social_links: profileData.social_links || {},
          cohort_id: profileData.cohort_id || "",
        });
      }
    });
    supabase.from("cohorts").select("*").order("year", { ascending: false }).then(({ data }) => {
      if (data) setCohorts(data as Cohort[]);
    });
  }, [userId]);

  const handleSave = async () => {
    const { error } = await supabase.from("profiles").update({
      display_name: form.display_name,
      bio: form.bio,
      location: form.location,
      institution: form.institution,
      career_interest: form.career_interest,
      skills: form.skills,
      social_links: form.social_links,
      cohort_id: form.cohort_id || null,
    }).eq("user_id", userId);
    
    if (!error) {
      toast({ title: "Profile updated!" });
      setEditing(false);
      // Refresh
      const { data } = await supabase.rpc("get_user_profile", { target_user_id: userId });
      if (data && data.length > 0) {
        const profileData = data[0] as Profile;
        setProfile(profileData);
        setCohort(profileData.cohorts || null);
      }
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => {
    setForm({ ...form, skills: form.skills.filter((sk: string) => sk !== s) });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `avatars/${user.id}/${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from("community-files").upload(path, file);
    if (error) { toast({ title: "Upload failed", variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("community-files").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("user_id", user.id);
    setProfile({ ...profile, avatar_url: urlData.publicUrl });
    toast({ title: "Avatar updated!" });
  };

  if (!profile) return <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>;

  const socialLinks = profile.social_links || {};

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {(profile.display_name ?? "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition">
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  <Save className="h-3 w-3" />
                </label>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="font-display text-2xl font-bold">{profile.display_name ?? "Member"}</h2>
              {profile.career_interest && (
                <p className="text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                  <Briefcase className="h-3.5 w-3.5" /> {profile.career_interest}
                </p>
              )}
              {profile.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                  <MapPin className="h-3.5 w-3.5" /> {profile.location}
                </p>
              )}
              {cohort && (
                <p className="text-sm text-primary flex items-center gap-1 justify-center sm:justify-start mt-1">
                  <GraduationCap className="h-3.5 w-3.5" /> {cohort.name} ({cohort.year})
                </p>
              )}
            </div>
            {!isOwnProfile && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onMessage(userId)}>
                  <MessageSquare className="h-4 w-4 mr-1" /> Message
                </Button>
              </div>
            )}
            {isOwnProfile && !editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </div>

        {/* Edit form */}
        {isOwnProfile && editing && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold">Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Display Name</label>
                <Input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Location</label>
                <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Freetown, Sierra Leone" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Institution</label>
                <Input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Career Interest</label>
                <Input value={form.career_interest} onChange={e => setForm({ ...form, career_interest: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Cohort</label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.cohort_id}
                  onChange={e => setForm({ ...form, cohort_id: e.target.value })}
                >
                  <option value="">Select Cohort</option>
                  {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">LinkedIn</label>
                <Input 
                  value={form.social_links?.linkedin || ""} 
                  onChange={e => setForm({ ...form, social_links: { ...form.social_links, linkedin: e.target.value } })} 
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Portfolio</label>
                <Input 
                  value={form.social_links?.portfolio || ""} 
                  onChange={e => setForm({ ...form, social_links: { ...form.social_links, portfolio: e.target.value } })} 
                  placeholder="https://your-portfolio.com"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Bio</label>
              <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Skills</label>
              <div className="flex gap-2 mb-2">
                <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                <Button size="sm" variant="outline" onClick={addSkill}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(form.skills ?? []).map((s: string) => (
                  <button key={s} onClick={() => removeSkill(s)} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-destructive/10 hover:text-destructive transition">
                    {s} ×
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Save</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Skills */}
        {(profile.skills ?? []).length > 0 && !editing && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(profile.skills as string[]).map((s: string) => (
                <span key={s} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {Object.values(socialLinks).some(v => v) && !editing && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-3">Links</h3>
            <div className="space-y-2">
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
                </a>
              )}
              {socialLinks.portfolio && (
                <a href={socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <ExternalLink className="h-3.5 w-3.5" /> Portfolio
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
