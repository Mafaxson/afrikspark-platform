import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Section, SectionHeader, AnimateOnScroll, StatCounter } from "@/components/SectionComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Quote, Send, Star } from "lucide-react";
import { getTestimonialSource, normalizeTestimonialRow, buildTestimonialSelect, clearTestimonialSourceCache } from "@/lib/testimonials";

const stats = [
  { value: "50+", label: "Youth Trained in Digital Skills" },
  { value: "200+", label: "Students Developed" },
  { value: "1000+", label: "Community Members Impacted" },
  { value: "3+", label: "Innovation Projects Launched" },
];

interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string | null;
  photo_url: string | null;
  video_url: string | null;
  testimonial_text: string;
  status: "active" | "hidden";
  created_at: string | null;
}

export default function Impact() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const source = await getTestimonialSource();
        const select = buildTestimonialSelect(source);
        const query = supabase.from(source).select(select).order("created_at", { ascending: false });
        const activeQuery =
          source === "testimonials"
            ? query.eq("status", "active")
            : query.or("status.eq.active,approved.eq.true");

        const { data, error } = await activeQuery;

        if (error) {
          console.error("Failed to load testimonials:", error);
          // If it's a 404 and we're still trying testimonials, clear cache and retry
          if (error.status === 404 && source === "testimonials") {
            clearTestimonialSourceCache();
            const retrySource = await getTestimonialSource();
            if (retrySource !== source) {
              const retrySelect = buildTestimonialSelect(retrySource);
              const retryQuery = supabase.from(retrySource).select(retrySelect).order("created_at", { ascending: false });
              const retryActiveQuery = retrySource === "testimonials"
                ? retryQuery.eq("status", "active")
                : retryQuery.or("status.eq.active,approved.eq.true");

              const { data: retryData } = await retryActiveQuery;
              if (retryData) setTestimonials(retryData.map((row: Record<string, unknown>) => normalizeTestimonialRow(row, retrySource)));
            }
          }
        } else if (data) {
          setTestimonials(data.map((row: Record<string, unknown>) => normalizeTestimonialRow(row, source)));
        }
      } catch (err) {
        console.error("Unexpected error loading testimonials:", err);
      }
      setLoading(false);
    };

    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const role = (formData.get("role") as string) || "Student";
    const name = (formData.get("name") as string) || "";
    const organization = (formData.get("organization") as string) || null;
    const testimonialText = (formData.get("testimony") as string) || "";

    const source = await getTestimonialSource();
    const payload: Record<string, string | boolean> =
      source === "testimonials"
        ? {
            name,
            role,
            organization,
            testimonial_text: testimonialText,
            status: "hidden",
            is_featured: false,
          }
        : {
            name,
            role,
            organization,
            testimony: testimonialText,
            status: "hidden",
            approved: false,
            featured: false,
          };

    const { error } = await supabase.from(source).insert(payload);

    if (error) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } else {
      toast({ title: "Thank you!", description: "Your testimony has been submitted and will appear after review." });
      form.reset();
    }
    setLoading(false);
  };

  return (
    <Layout>
      <section className="bg-hero min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(25_95%_53%/0.12),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <AnimateOnScroll>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">Testimonies</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Voices of Impact
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl">
              Real stories from the people whose lives we've touched through our programs.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <Section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {stats.map((stat, i) => (
            <AnimateOnScroll key={stat.label} delay={i * 100}>
              <StatCounter value={stat.value} label={stat.label} />
            </AnimateOnScroll>
          ))}
        </div>
      </Section>

      {/* Testimonies */}
      <Section alt>
        <SectionHeader badge="Testimonies" title="What People Say" description="Hear from our scholars, partners, and community members." />
        {testimonials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimateOnScroll key={t.id} delay={i * 80}>
                <div className="bg-card rounded-xl p-6 border border-border h-full flex flex-col">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  {t.image_url && (
                    <img src={t.image_url} alt={t.name} className="w-16 h-16 rounded-full object-cover mb-4" />
                  )}
                  {t.video_url && (
                    <video controls className="w-full rounded-lg mb-4 max-h-48 object-cover">
                      <source src={t.video_url} />
                    </video>
                  )}
                  <p className="text-muted-foreground leading-relaxed flex-1 mb-4">"{t.testimonial_text}"</p>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-display font-semibold text-sm">{t.name}</span>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        ) : (
          <AnimateOnScroll>
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Quote className="h-12 w-12 text-primary/20 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Testimonies Coming Soon</h3>
              <p className="text-muted-foreground">Be the first to share your experience with AfrikSpark!</p>
            </div>
          </AnimateOnScroll>
        )}
      </Section>

      {/* Submit Testimony */}
      <Section>
        <SectionHeader badge="Share" title="Share Your Story" description="Have we made an impact on your life? We'd love to hear from you." />
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 border border-border space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Your Name *</label>
                <Input name="name" required placeholder="Your full name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Role *</label>
                <select
                  name="role"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Student">Student</option>
                  <option value="Client">Client</option>
                  <option value="Partner">Partner</option>
                  <option value="Mentor">Mentor</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Organization (optional)</label>
              <Input name="organization" placeholder="Organization or school" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Your Testimony *</label>
              <Textarea name="testimony" required placeholder="Tell us how AfrikSpark has impacted your life..." rows={5} />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Submitting..." : "Submit Testimony"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">Your testimony will be reviewed before being published.</p>
          </form>
        </div>
      </Section>
    </Layout>
  );
}
