import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Section, SectionHeader, AnimateOnScroll } from "@/components/SectionComponents";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  description?: string | null;
  tag?: string | null;
  logo_url?: string | null;
  project_link?: string | null;
  is_live: boolean;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, description, tag, logo_url, project_link, is_live")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLearnMore = (project: Project) => {
    if (project?.is_live && project?.project_link) {
      if (project.project_link.startsWith('http')) {
        window.open(project.project_link, '_blank');
      } else {
        window.location.href = project.project_link;
      }
    } else {
      alert("Coming Soon / Under Development");
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="bg-hero min-h-[40vh] flex items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(25_95%_53%/0.12),transparent_60%)]" />
          <div className="container mx-auto px-4 relative z-10 py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading projects...</p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-hero min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(25_95%_53%/0.12),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <AnimateOnScroll>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">Our Work</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Innovation Projects</h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl">
              Technology-driven projects addressing real challenges across Africa.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <AnimateOnScroll key={project?.id || i} delay={i * 100}>
              <div className="bg-card rounded-xl border border-border overflow-hidden card-hover h-full flex flex-col">
                <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={project.logo_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  {project?.tag && (
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded mb-3 w-fit">
                      {project.tag}
                    </span>
                  )}
                  <h3 className="font-display font-bold text-xl mb-2">{project.title || "Unnamed Project"}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {project?.description || 'Project description coming soon.'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 w-fit"
                    onClick={() => handleLearnMore(project)}
                  >
                    Learn More
                    {project?.is_live && project?.project_link && <ExternalLink className="ml-2 h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </Section>
    </Layout>
  );
}
