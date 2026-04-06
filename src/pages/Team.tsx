import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Section, SectionHeader, AnimateOnScroll } from "@/components/SectionComponents";
import { supabase } from "@/integrations/supabase/client";
import { User, Loader2 } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
}

export default function Team() {
  const { data: teamMembers, isLoading, error } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('position', { ascending: true, nulls: 'last' });

        if (error) {
          console.error('Error fetching team members:', error);
          throw error;
        }

        return (data || []) as TeamMember[];
      } catch (err) {
        console.error('Team fetch error:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Layout>
        <Section>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading team members...</p>
            </div>
          </div>
        </Section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Section>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Unable to load team members at this time.</p>
            <p className="text-sm text-muted-foreground">Please check back later or contact support if the problem persists.</p>
          </div>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Our Team - AfrikSpark Tech Solutions Leadership</title>
        <meta name="description" content="Meet the AfrikSpark Tech Solutions team. Passionate leaders driving youth empowerment, digital skills training, and innovation across Sierra Leone and Africa." />
        <meta name="keywords" content="AfrikSpark team, leadership, digital skills trainers, youth empowerment, Sierra Leone team, innovation leaders" />
        <meta property="og:title" content="Our Team - AfrikSpark Tech Solutions" />
        <meta property="og:description" content="Meet the passionate team behind Africa's leading youth empowerment platform." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AfrikSpark Team" />
        <meta name="twitter:description" content="Leadership team driving digital skills and innovation in Sierra Leone." />
      </Helmet>
      {/* Hero */}
      <section className="bg-hero min-h-[50vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,hsl(25_95%_53%/0.12),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <AnimateOnScroll>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">Our Team</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4 max-w-2xl">
              Meet the AfrikSpark Team
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl">
              The passionate individuals driving innovation and youth empowerment across Africa.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Team Grid */}
      <Section>
        <SectionHeader badge="Our People" title="Leadership Team" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {teamMembers?.map((member, index) => (
            <AnimateOnScroll key={member.id} delay={index * 100}>
              <div className="bg-card rounded-xl p-6 border border-border text-center hover:shadow-lg transition-shadow">
                {/* Profile Image */}
                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <User className="h-16 w-16 text-primary" />
                  )}
                </div>

                {/* Member Info */}
                <h3 className="font-display text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                {member.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {(!teamMembers || teamMembers.length === 0) && (
          <div className="text-center py-12 col-span-full">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No team members added yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Team members will be displayed here once added to the system.</p>
          </div>
        )}
      </Section>
    </Layout>
  );
}