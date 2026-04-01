import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Section } from "@/components/SectionComponents";

interface Student {
  id: string;
  full_name: string;
  email: string;
  skill?: string;
  district: string;
  avatar_url?: string;
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

export default function CohortPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['cohortPage', id],
    queryFn: async () => {
      if (!id) throw new Error('Cohort ID is required');

      const [cohortRes, studentsRes] = await Promise.all([
        supabase.from("cohorts").select("*").eq("id", id).single(),
        supabase.from("community_members").select("*").eq("cohort_id", id).eq("approved", true)
      ]);

      if (cohortRes.error) throw cohortRes.error;
      if (studentsRes.error) throw studentsRes.error;

      return {
        cohort: cohortRes.data as Cohort,
        students: studentsRes.data as Student[]
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const cohort = data?.cohort;
  const students = data?.students || [];

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
              src={cohort.banner_url}
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
        <h2 className="text-2xl font-bold mb-8">Students</h2>

        {students.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No students in this cohort yet</h3>
            <p className="text-muted-foreground">Students will be added to this cohort as they join the program.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div key={student.id} className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {student.avatar_url ? (
                    <img
                      src={student.avatar_url}
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
                    <p className="text-sm text-muted-foreground mb-1">{student.district}</p>
                    {student.skill && (
                      <p className="text-sm text-primary mb-2">{student.skill}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(student.created_at || '').toLocaleDateString()}
                    </p>
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