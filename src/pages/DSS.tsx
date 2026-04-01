/// <reference types="react" />
import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Section, SectionHeader, AnimateOnScroll } from "@/components/SectionComponents";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, GraduationCap, Palette, Video, Camera, Code, Megaphone, Users, Briefcase, Heart, Star, MessageCircle, ArrowRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

function ApplicationButton() {
  const [link, setLink] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "dss_application_link")
          .maybeSingle();

        if (!isMountedRef.current) return;

        if (error) {
          console.error("Failed to load application link", error);
          return;
        }

        if (data?.value) {
          setLink(data.value);
        }
      } catch (error) {
        console.error("Application link fetch error", error);
      }
    };

    fetchLink();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (!link) {
    return <p className="text-muted-foreground text-sm">Applications are currently closed. Check back soon!</p>;
  }

  return (
    <Button size="lg" className="w-full" asChild>
      <a href={link} target="_blank" rel="noopener noreferrer">
        Apply Now <ExternalLink className="ml-2 h-4 w-4" />
      </a>
    </Button>
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

interface CommunityMember {
  id: string;
  name: string;
  avatar_url: string | null;
  skill: string | null;
  district: string | null;
  cohort_id: string | null;
}

interface Cohort {
  id: string;
  name: string;
  description: string | null;
  students: CommunityMember[];
}

export default function DSS() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [isLoadingCohorts, setIsLoadingCohorts] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const { data: cohortsData, error } = await supabase
          .from("cohorts")
          .select("id,name,description")
          .order("name", { ascending: true });

        if (!isMountedRef.current) return;

        if (error) {
          console.error("Failed to load cohorts", error);
          setIsLoadingCohorts(false);
          return;
        }

        if (!cohortsData) {
          setCohorts([]);
          setIsLoadingCohorts(false);
          return;
        }

        const withStudents = await Promise.all(
          cohortsData.map(async (cohort) => {
            const { data: members, error: membersError } = await supabase
              .from("students")
              .select("id,name,photo_url,skill,city,cohort_id")
              .eq("cohort_id", cohort.id);

            if (membersError) {
              console.error("Failed to load members for cohort", cohort.id, membersError);
            }

            const transformedMembers = (members ?? []).map(member => ({
              id: member.id,
              name: member.name,
              avatar_url: member.photo_url,
              skill: member.skill,
              district: member.city,
              cohort_id: member.cohort_id
            }));

            return { ...cohort, students: transformedMembers };
          })
        );

        if (isMountedRef.current) {
          setCohorts(withStudents);
          setIsLoadingCohorts(false);
        }
      } catch (error) {
        console.error("Cohorts fetch unexpected error", error);
        if (isMountedRef.current) {
          setIsLoadingCohorts(false);
        }
      }
    };

    fetchCohorts();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const openCohort = async (cohort: Cohort) => {
    if (!isMountedRef.current) return;

    try {
      if (cohort.students.length === 0) {
        const { data: students, error } = await supabase
          .from("students")
          .select("id,name,photo_url,skill,city,cohort_id")
          .eq("cohort_id", cohort.id);

        if (!isMountedRef.current) return;

        if (error) {
          console.error("Failed to load cohort students", error);
          return;
        }

        const transformedStudents = (students ?? []).map(student => ({
          id: student.id,
          name: student.name,
          avatar_url: student.photo_url,
          skill: student.skill,
          district: student.city,
          cohort_id: student.cohort_id
        }));

        const updated = { ...cohort, students: transformedStudents };

        // Update both selected cohort and the cohorts array atomically
        setSelectedCohort(updated);
        setCohorts((prev) => prev.map((c) => (c.id === cohort.id ? updated : c)));
      } else {
        setSelectedCohort(cohort);
      }
    } catch (error) {
      console.error("Error in openCohort", error);
    }
  };

  const closeCohort = () => {
    if (isMountedRef.current) {
      setSelectedCohort(null);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-hero min-h-[50vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(25_95%_53%/0.15),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <AnimateOnScroll>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
              <GraduationCap className="h-4 w-4" />
              Digital Skills Scholarship
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4 max-w-3xl">
              Transform Your Future with <span className="text-gradient">Free Digital Skills</span> Training
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl mb-8">
              The DSS program trains young people who completed high school but cannot attend university due to financial barriers. Gain practical skills and mentorship until you start earning.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="hero" asChild>
                <a href="#apply">
                  Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="hero-outline" asChild>
                <a href="#about-dss">Learn More</a>
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* About DSS */}
      <Section id="about-dss">
        <SectionHeader badge="About DSS" title="What is the Digital Skills Scholarship?" description="" />
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <div className="bg-card rounded-xl p-8 border border-border space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                The <strong className="text-foreground">Digital Skills Scholarship (DSS)</strong> is AfrikSpark's flagship program designed to bridge the gap between talent and opportunity. In Sierra Leone, thousands of young people graduate from high school every year but cannot pursue higher education due to financial barriers.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                DSS identifies these bright, motivated individuals and provides them with <strong className="text-foreground">free, intensive training</strong> in high-demand digital skills — from graphic design and videography to web development and content creation. But we don't stop at training.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Each scholar receives <strong className="text-foreground">mentorship, real-world project experience, and career support</strong> until they land their first paying client or job. Our goal is simple: turn potential into income, and talent into careers.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {[
                  { value: "6 Months", label: "Training Duration" },
                  { value: "100%", label: "Free of Charge" },
                  { value: "1:5", label: "Mentor Ratio" },
                  { value: "Until Hired", label: "Support Duration" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="font-display text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </Section>

      {/* Eligibility Criteria */}
      <Section alt id="eligibility">
        <SectionHeader badge="Who Can Apply?" title="Eligibility Criteria" description="Make sure you meet the following requirements before applying." />
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <div className="bg-card rounded-xl border border-border p-8">
              <ul className="space-y-4">
                {[
                  "Must be between 16 and 35 years old.",
                  "Must have completed high school (SSCE/WASSCE or equivalent).",
                  "Unable to attend university due to financial constraints.",
                  "Must be a resident of Sierra Leone.",
                  "Must have access to a smartphone or computer (we can help with this).",
                  "Must be committed to attending the full 6-month training program.",
                  "No prior experience in digital skills required — just passion and willingness to learn.",
                  "Must be available for in-person or virtual training sessions as scheduled.",
                ].map((item, i) => (
                  <li key={`eligibility-${i}`} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(cohorts ?? []).map((cohort) => (
                <AnimateOnScroll key={cohort.id}>
                  <div
                    onClick={() => openCohort(cohort)}
                    className="cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="h-44 w-full overflow-hidden relative">
                      <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                        <span className="text-muted-foreground">Cohort {cohort.name}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold">{cohort.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cohort.description || "No description available."}</p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            {selectedCohort && (
              <AnimateOnScroll>
                <div className="mt-8 rounded-xl border border-border bg-card p-6 relative">
                  <button
                    onClick={closeCohort}
                    className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    aria-label="Close cohort details"
                  >
                    ×
                  </button>
                  <div className="relative h-56 w-full overflow-hidden rounded-xl">
                    <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                      <span className="text-muted-foreground">Cohort {selectedCohort.name}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold">{selectedCohort.name}</h3>
                    <p className="text-muted-foreground mt-2">{selectedCohort.description || "No cohort description available."}</p>
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedCohort.students.length === 0 ? (
                      <div className="col-span-full text-center text-muted-foreground">No members found in this cohort.</div>
                    ) : (
                      selectedCohort.students.map((member) => (
                        <div
                          key={member.id}
                          className="rounded-xl border border-border bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.alert(`Open profile for ${member.name}`)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatar_url || "/placeholder-avatar.jpg"} />
                              <AvatarFallback>{member.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{member.name || "Unknown Member"}</p>
                              <p className="text-xs text-muted-foreground">{member.skill || "Skill unknown"}</p>
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground">{member.district || "District unknown"}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </AnimateOnScroll>
            )}
          </>
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
              <h3 className="font-display text-xl font-bold mb-2">Application Fee: LE 250</h3>
              <p className="text-muted-foreground">
                A small application fee of <span className="font-semibold text-foreground">LE 250</span> is required to process your application. This helps us manage the selection process and ensure serious applicants.
              </p>
            </div>
            <div className="space-y-3">
              <ApplicationButton />
              <p className="text-xs text-muted-foreground">You will be redirected to an external form where you can complete your application and make payment.</p>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
