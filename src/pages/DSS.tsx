import { useState, useEffect, useRef, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Section, SectionHeader, AnimateOnScroll } from "@/components/SectionComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Palette, Video, Camera, Code, Megaphone, Users, Briefcase, Heart, Star, MessageCircle, ArrowRight, ExternalLink, Play, DollarSign, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { buildTestimonialSelect, normalizeTestimonialRow, NormalizedTestimonial } from "@/lib/testimonials";

function ApplicationButton() {
  const [settings, setSettings] = useState<{ application_link: string | null; is_open: boolean; note: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("application_settings")
          .select("application_link,is_open,note")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!isMountedRef.current) return;

        if (error) {
          console.error("Failed to load application settings", error);
          return;
        }

        setSettings(data ?? { application_link: null, is_open: false, note: null });
      } catch (error) {
        console.error("Application settings fetch error", error);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    fetchSettings();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isOpen = Boolean(settings?.is_open && settings.application_link);

  return (
    <div className="space-y-3">
      <Button size="lg" className="w-full" asChild disabled={!isOpen}>
        {isOpen ? (
          <a href={settings.application_link ?? "#"} target="_blank" rel="noopener noreferrer">
            Apply Now <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        ) : (
          <span>Apply Now</span>
        )}
      </Button>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading application settings…</p>
      ) : !isOpen ? (
        <p className="text-muted-foreground text-sm">Applications are currently closed. Join the waitlist.</p>
      ) : (
        <p className="text-muted-foreground text-sm">Applications are reviewed on motivation, commitment, and readiness to learn.</p>
      )}
      {settings?.note ? <p className="text-sm text-muted-foreground">{settings.note}</p> : null}
    </div>
  );
}

const skills = [
  { icon: Megaphone, title: "Content Creation", description: "Learn to create engaging content for social media, blogs, and brands." },
  { icon: Palette, title: "Graphic Design", description: "Master design tools like Canva, Photoshop, and Illustrator." },
  { icon: Video, title: "Videography", description: "Shoot, edit, and produce professional videos for clients." },
  { icon: Camera, title: "Photography", description: "Learn composition, lighting, and professional photo editing." },
  { icon: Code, title: "Web & App Development", description: "Build websites and applications with modern technologies." },
];

const whyJoin = [
  { icon: BookOpen, title: "100% Free Training", description: "No tuition fees. We cover everything — you just bring your passion and dedication." },
  { icon: Briefcase, title: "Earn While You Learn", description: "We support you until you land your first paid gig or job. Real projects, real income." },
  { icon: Users, title: "Mentorship & Community", description: "Get paired with experienced mentors and join a network of ambitious young creatives." },
  { icon: Star, title: "Industry Certifications", description: "Earn recognized certificates that boost your portfolio and employability." },
  { icon: Heart, title: "No University Required", description: "Designed for those who can't afford university. Your talent is your ticket." },
  { icon: MessageCircle, title: "Private Community Access", description: "Join our exclusive Slack-like community to collaborate, share opportunities, and grow together." },
];

interface Student {
  id: string;
  full_name: string;
  image_url: string | null;
  skills: string | string[] | null;
  district: string | null;
  gender: string | null;
  cohort_id: string | null;
}

interface Cohort {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  banner_url: string | null;
  year?: number;
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

export default function DSS() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoadingCohorts, setIsLoadingCohorts] = useState(true);
  const [dssTestimonials, setDssTestimonials] = useState<NormalizedTestimonial[]>([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState<NormalizedTestimonial | null>(null);
  const [testimonialFilter, setTestimonialFilter] = useState<"all" | "video" | "students" | "partners" | "mentors">("all");
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [statValues, setStatValues] = useState<number[]>([0, 0, 0, 0, 0]);
  const [hasAnimatedStats, setHasAnimatedStats] = useState(false);
  const statsSectionRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(true);
  const { toast } = useToast();


  const testimonialCategories = [
    { value: "all", label: "All" },
    { value: "video", label: "Video Stories" },
    { value: "students", label: "Students" },
    { value: "partners", label: "Partners" },
    { value: "mentors", label: "Mentors" },
  ] as const;

  const statTargets = [
    { label: "Youth Trained", value: 200, suffix: "+" },
    { label: "Cities Reached", value: 2, suffix: "" },
    { label: "Target Scholars (2026)", value: 600, suffix: "" },
    { label: "Startup Grants Planned", value: 100, suffix: "" },
    { label: "Cities Targeted", value: 4, suffix: "" },
  ];

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const { data: cohortsData, error } = await supabase
          .from("cohorts")
          .select("*")
          .order("year", { ascending: false });

        if (!isMountedRef.current) return;

        if (error) {
          console.error("Failed to load cohorts", error);
          setIsLoadingCohorts(false);
          return;
        }

        setCohorts((cohortsData || []) as Cohort[]);
      } catch (error) {
        console.error("Cohorts fetch unexpected error", error);
      } finally {
        if (isMountedRef.current) {
          setIsLoadingCohorts(false);
        }
      }
    };

    const fetchTestimonials = async () => {
      setTestimonialsLoading(true);
      try {
        const select = buildTestimonialSelect("testimonials");
        const { data, error } = await supabase
          .from("testimonials")
          .select(select)
          .eq("status", "approved")
          .eq("program_tag", "DSS")
          .order("created_at", { ascending: false });

        if (!isMountedRef.current) return;
        if (error) {
          console.error("Failed to load DSS testimonials", error);
          return;
        }

        const items = (data || []).map((row: Record<string, unknown>) => normalizeTestimonialRow(row, "testimonials"));
        setDssTestimonials(items);
      } catch (error) {
        console.error("DSS testimonial fetch unexpected error", error);
      } finally {
        if (isMountedRef.current) {
          setTestimonialsLoading(false);
        }
      }
    };

    fetchCohorts();
    fetchTestimonials();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (hasAnimatedStats || !statsSectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimatedStats(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(statsSectionRef.current);

    return () => observer.disconnect();
  }, [hasAnimatedStats]);

  useEffect(() => {
    if (!hasAnimatedStats) return;

    const duration = 1200;
    const start = performance.now();
    const easeOutQuad = (t: number) => t * (2 - t);

    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      setStatValues(statTargets.map((item) => Math.round(item.value * easeOutQuad(progress))));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasAnimatedStats]);

  const filteredTestimonials = useMemo(() => {
    return dssTestimonials.filter((item) => {
      if (testimonialFilter === "video") return Boolean(item.video_url);
      if (testimonialFilter === "students") return item.role.toLowerCase().includes("student");
      if (testimonialFilter === "partners") return item.role.toLowerCase().includes("partner");
      if (testimonialFilter === "mentors") return item.role.toLowerCase().includes("mentor");
      return true;
    });
  }, [dssTestimonials, testimonialFilter]);

  const latestVideoTestimonial = dssTestimonials.find((item) => item.video_url);

  const applicationSectionCopy = "Applications are reviewed based on motivation, commitment, and readiness to learn.";

  const statisticCards = statTargets.map((stat, index) => ({
    ...stat,
    value: statValues[index] ?? 0,
  }));

  const programBenefits = [
    "100% Free Scholarship Training",
    "Earn While You Learn",
    "Freelancing Opportunities",
    "Entrepreneurship Coaching",
    "Career Mentorship",
    "Industry Certificates",
    "Alumni Community Access",
    "Startup Pitch Opportunities",
  ];

  const learningAreas = [
    "Graphic Design",
    "Video Editing & Media",
    "Web Development",
    "App Development",
    "Content Creation",
    "AI Productivity Tools",
    "Photography",
    "Digital Marketing",
    "Business & Entrepreneurship",
  ];

  const eligibilityItems = [
    "Age 16–35",
    "Completed High School (WASSCE/Equivalent)",
    "Resident in Sierra Leone",
    "Unable to access university due to financial barriers",
    "Passionate and committed",
    "Available for training sessions",
    "No experience required",
  ];


  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.20),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.18),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.85),rgba(15,23,42,0.55))]" />
        <div className="container mx-auto px-4 relative z-10 py-24">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_0.9fr] items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide text-sky-200 mb-6">
                <GraduationCap className="h-4 w-4" />
                Digital Skills Scholarship
              </span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-5xl md:text-6xl font-bold tracking-tight max-w-3xl leading-tight"
              >
                Transform Talent Into Income.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-6 max-w-2xl text-lg text-slate-300"
              >
                AfrikSpark’s Digital Skills Scholarship equips ambitious young Sierra Leoneans facing financial barriers with practical digital skills, mentorship, entrepreneurship training, and career pathways — completely free.
              </motion.p>

              <div className="mt-10 grid gap-4 sm:grid-cols-[minmax(240px,1fr)_auto_auto] items-start">
                <div className="sm:col-span-1">
                  <ApplicationButton />
                </div>
                <Button size="lg" variant="hero" asChild className="w-full sm:w-auto">
                  <Link to="/testimonials">Watch Success Stories</Link>
                </Button>
                <Button size="lg" variant="hero" asChild className="w-full sm:w-auto">
                  <Link to="/donate">Donate</Link>
                </Button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.35)]"
            >
              <div className="grid gap-6">
                <div className="rounded-3xl bg-slate-900/90 p-6 ring-1 ring-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
                      <Play className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.22em] text-sky-300">Impact Snapshot</p>
                      <p className="text-xl font-semibold text-white">Powered by purpose, people, and proven results.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-slate-300">A premium training experience for young people who need a fair chance at a digital future.</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-950/80 p-4">
                        <p className="text-2xl font-semibold">100%</p>
                        <p className="text-sm text-slate-400">Scholarship training</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950/80 p-4">
                        <p className="text-2xl font-semibold">Mentorship</p>
                        <p className="text-sm text-slate-400">Career and startup support</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/90 p-5 ring-1 ring-white/10">
                    <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Scholar Focus</p>
                    <p className="mt-3 text-lg font-semibold text-white">Practical digital skills with real work outcomes.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-5 ring-1 ring-white/10">
                    <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Partner Growth</p>
                    <p className="mt-3 text-lg font-semibold text-white">Built for donors, employers and changemakers.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About DSS */}
      <Section id="about-dss">
        <SectionHeader badge="About DSS" title="The Digital Skills Scholarship was created to close the gap between talent and opportunity." description="" />
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <div className="bg-card rounded-xl p-10 border border-border space-y-8">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Every year, thousands of young people finish high school in Sierra Leone but cannot continue to university because of financial barriers. Many are left without direction, opportunity, or a clear career pathway.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                DSS changes that story. We identify motivated young people and provide intensive hands-on training in high-demand skills such as graphic design, web development, content creation, freelancing, entrepreneurship, and AI productivity tools.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                But we do not stop at training. Every scholar receives mentorship, real-world opportunities, and support until they begin earning income or building their own venture.
              </p>
              <div className="rounded-3xl bg-slate-950/80 p-8 border border-white/10">
                <p className="text-xl font-semibold text-white">Our mission is simple:</p>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li>Turn potential into income.</li>
                  <li>Turn talent into careers.</li>
                  <li>Turn youth into job creators.</li>
                </ul>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </Section>

      <Section>
        <SectionHeader badge="Why Sponsor DSS?" title="Why Sponsor DSS?" description="By sponsoring the Digital Skills Scholarship, you help transform untapped youth potential into real income, careers, startups, and long-term economic growth in Sierra Leone." />
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Empower Youth Employment",
                description: "Help young people gain practical digital skills and income opportunities."
              },
              {
                title: "Build Future Entrepreneurs",
                description: "Support startup ideas, innovation, and job creation."
              },
              {
                title: "Promote Digital Inclusion",
                description: "Expand access to technology and opportunity."
              },
              {
                title: "Create Real Social Impact",
                description: "Reduce unemployment, idleness, and risky migration pathways."
              },
              {
                title: "Strengthen Communities",
                description: "One trained youth can uplift an entire family."
              },
              {
                title: "Gain Visibility As A Partner",
                description: "Sponsors may be recognized publicly (optional)."
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.1 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" variant="hero" asChild>
              <Link to="/donate">Donate</Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              For partnerships, grants, CSR sponsorships, or custom support packages, contact AfrikSpark directly.
            </p>
          </div>
        </div>
      </Section>

      {/* Eligibility Criteria */}
      <Section alt id="eligibility">
        <SectionHeader badge="Who Can Apply?" title="Eligibility Criteria" description="" />
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <div className="bg-card rounded-xl border border-border p-8">
              <ul className="space-y-4">
                {eligibilityItems.map((item, index) => (
                  <li key={`eligibility-${index}`} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Star className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimateOnScroll>
        </div>
      </Section>

      {/* Why Join DSS */}
      <Section>
        <SectionHeader badge="Why Join?" title="Why You Should Apply for DSS" description="Here's what makes our program different from anything else out there." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyJoin.map((item, i) => (
            <AnimateOnScroll key={item.title} delay={i * 80}>
              <div className="p-6 rounded-xl bg-card border border-border card-hover h-full">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </Section>

      {/* Skills Covered */}
      <Section>
        <SectionHeader badge="What You'll Learn" title="Skills Covered" description="Master in-demand digital skills that open doors to freelancing, employment, and entrepreneurship." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {skills.map((skill, i) => (
            <AnimateOnScroll key={skill.title} delay={i * 80}>
              <div className="text-center p-6 rounded-xl bg-card border border-border card-hover">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <skill.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm mb-2">{skill.title}</h3>
                <p className="text-muted-foreground text-xs">{skill.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </Section>

      {/* Cohorts */}
      <Section alt id="cohorts">
        <SectionHeader badge="Our Cohorts" title="Meet Our Scholars" description="Browse through our cohorts and see the talented individuals who have graduated from the DSS program." />
        {isLoadingCohorts ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading cohorts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(cohorts ?? []).map((cohort) => (
              <AnimateOnScroll key={cohort.id}>
                <Link
                  to={`/cohort/${cohort.slug}`}
                  className="block overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-44 w-full overflow-hidden relative">
                    {cohort.banner_url ? (
                      <img
                        src={getStorageUrl("cohorts", cohort.banner_url) || undefined}
                        alt={cohort.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                        <span className="text-muted-foreground">Cohort {cohort.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold">{cohort.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cohort.description || "No description available."}</p>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        )}
      </Section>

      {/* Community */}
      <Section id="community">
        <SectionHeader badge="DSS Community" title="Join the DSS Community" description="Once accepted into DSS, you gain access to our private community platform — your hub for collaboration, mentorship, and opportunities." />
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <div className="bg-card rounded-xl border border-border p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { icon: MessageCircle, title: "Channel Discussions", desc: "Topic-based channels for each skill, general chat, and announcements." },
                  { icon: Users, title: "Direct Messaging", desc: "Connect one-on-one with mentors, peers, and alumni." },
                  { icon: Briefcase, title: "Opportunity Board", desc: "Find freelance gigs, job openings, and collaboration opportunities." },
                ].map((feature) => (
                  <div key={feature.title} className="text-center p-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-display font-semibold mb-1">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Already a DSS member? Access the community platform.</p>
                <Button asChild>
                  <Link to="/community">Go to Community <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </Section>

      {/* Application */}
      <Section alt id="apply">
        <SectionHeader badge="Join Us" title="Apply for DSS" description="Ready to start your journey? Apply now through our application form." />
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-border text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">
                Applications are merit-based and reviewed according to motivation, commitment, and readiness to learn.
              </p>
            </div>
            <div className="space-y-3">
              <ApplicationButton />
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div ref={statsSectionRef}>
          <SectionHeader badge="Our Impact" title="Our Impact So Far" description="Transforming potential into opportunity across Sierra Leone." />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
            {statisticCards.map((stat, index) => (
              <AnimateOnScroll key={stat.label} delay={index * 80}>
                <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20">
                  <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                    {stat.value}
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-slate-300">{stat.label}</div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </Section>
    </Layout>
  );
}
