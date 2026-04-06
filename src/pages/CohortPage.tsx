import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Section } from "@/components/SectionComponents";

interface Student {
  id: string;
  full_name: string;
  email?: string;
  skills: string | string[] | null;
  district: string;
  gender: string | null;
  image_url?: string | null;
  approved: boolean;
  created_at?: string;
}

interface Cohort {
  id: string;
  name: string;
  year: number;
  description?: string;
  banner_url?: string;
  created_at: string;
}

function getStorageUrl(bucket: "cohorts" | "students", path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
}

function normalizeSkills(skills: string | string[] | null) {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.filter(Boolean).map((skill) => String(skill).trim());
  return String(skills)
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export default function CohortPage() {
  const { slug } = useParams<{ slug: string }>();

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data, isLoading } = useQuery({
    queryKey: ['cohortPage', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Cohort slug is required');

      const cohortRes = await supabase.from("cohorts").select("*").eq("slug", slug).single();
      if (cohortRes.error) {
        if (!cohortRes.data) {
          return { cohort: null, students: [] };
        }
        throw cohortRes.error;
      }

      const cohort = cohortRes.data as Cohort;
      const studentsRes = await supabase
        .from("students")
        .select("*")
        .eq("cohort_id", cohort.id)
        .order("full_name", { ascending: true });

      if (studentsRes.error) throw studentsRes.error;

      return {
        cohort,
        students: studentsRes.data || []
      };
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const cohort = data?.cohort;
  const students = data?.students || [];

  const districtOptions = useMemo(
    () => Array.from(new Set(students.map((student) => student.district?.trim()).filter(Boolean) as string[])).sort(),
    [students]
  );

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return students
      .filter((student) => {
        const matchesName = !normalizedSearch || student.full_name.toLowerCase().includes(normalizedSearch);
        const matchesGender = !genderFilter || (student.gender || "").toLowerCase() === genderFilter.toLowerCase();
        const skills = normalizeSkills(student.skills);
        const matchesSkill = !skillFilter || skills.some((skill) => skill.toLowerCase() === skillFilter.toLowerCase());
        const matchesDistrict = !districtFilter || (student.district || "").toLowerCase().includes(districtFilter.toLowerCase());
        return matchesName && matchesGender && matchesSkill && matchesDistrict;
      })
      .sort((a, b) => {
        if (sortOrder === "asc") return a.full_name.localeCompare(b.full_name);
        return b.full_name.localeCompare(a.full_name);
      });
  }, [students, search, genderFilter, skillFilter, districtFilter, sortOrder]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!cohort) {
    return (
      <Layout>
        <Section>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Cohort Not Found</h1>
            <p className="text-muted-foreground">The cohort you're looking for doesn't exist.</p>
          </div>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Cohort Header */}
      <div className="relative">
        {cohort.banner_url && (
          <div className="h-64 bg-gradient-to-r from-primary/20 to-secondary/20 relative overflow-hidden">
            <img
              src={getStorageUrl("cohorts", cohort.banner_url) || undefined}
              alt={cohort.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        )}
        <Section className={cohort.banner_url ? "-mt-32 relative z-10" : ""}>
          <div className={`bg-card rounded-xl p-8 border border-border ${cohort.banner_url ? "shadow-xl" : ""}`}>
            <h1 className="text-3xl font-bold mb-2">{cohort.name}</h1>
            {cohort.description && (
              <p className="text-lg text-muted-foreground mb-4">{cohort.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Class of {cohort.year}</span>
              <span>•</span>
              <span>{students.length} {students.length === 1 ? 'Student' : 'Students'}</span>
            </div>
          </div>
        </Section>
      </div>

      {/* Students Grid */}
      <Section>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Students</h2>
            <p className="text-sm text-muted-foreground mt-1">Search and filter students for this cohort.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 w-full lg:w-auto">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground"
            >
              <option value="asc">Alphabetical A–Z</option>
              <option value="desc">Alphabetical Z–A</option>
            </select>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground"
            >
              <option value="">All Skills</option>
              <option value="Content Creation">Content Creation</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Videography">Videography</option>
              <option value="Photography">Photography</option>
              <option value="Web Development">Web Development</option>
            </select>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground"
            >
              <option value="">All Districts</option>
              {districtOptions.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="search"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
          />
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No students match your search.</h3>
            <p className="text-muted-foreground">Try clearing filters or using a different name.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {student.image_url ? (
                    <img
                      src={getStorageUrl("students", student.image_url) || undefined}
                      alt={student.full_name}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-lg">
                        {student.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{student.full_name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{student.gender || "Gender not specified"}</p>
                    <p className="text-sm text-primary mb-2">{student.district || "District unknown"}</p>
                    <div className="flex flex-wrap gap-2">
                      {normalizeSkills(student.skills).map((skill) => (
                        <span key={skill} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </Layout>
  );
}