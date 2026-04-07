const fs = require('fs');
const path = 'src/pages/DSS.tsx';
const content = `import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Section, SectionHeader, AnimateOnScroll } from "@/components/SectionComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadService } from "@/lib/uploadService";
import { BookOpen, GraduationCap, Palette, Video, Camera, Code, Megaphone, Users, Briefcase, Heart, Star, MessageCircle, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const skills = [
  { icon: Megaphone, title: "Content Creation", desc: "Learn to create engaging content for social media, blogs, and brands." },
  { icon: Palette, title: "Graphic Design", desc: "Master design tools like Canva, Photoshop, and Illustrator." },
  { icon: Video, title: "Videography", desc: "Shoot, edit, and produce professional videos for clients." },
  { icon: Camera, title: "Photography", desc: "Learn composition, lighting, and professional photo editing." },
  { icon: Code, title: "Web Development", desc: "Build websites and applications with modern technologies." },
];

const communityBenefits = [
  { icon: Users, title: "Mentorship & Community", desc: "Get paired with experienced mentors and join a network of ambitious young creatives." },
  { icon: Star, title: "Industry Certifications", desc: "Earn recognized certificates that boost your portfolio and employability." },
  { icon: Heart, title: "No University Required", desc: "Designed for those who can't afford university. Your talent is your ticket." },
  { icon: MessageCircle, title: "Private Community Access", desc: "Join our exclusive community to collaborate, share opportunities, and grow together." },
];

interface Cohort {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  banner_url: string | null;
  year?: number;
}

interface ApplicationSettings {
  is_open: boolean;
  deadline: string | null;
  closing_message: string | null;
  application_fee: string | null;
  payment_instructions: string | null;
}

interface DistrictQuota {
  district: string;
  max_slots: number;
  is_closed: boolean;
}

interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  district: string;
  skills: string[];
}

function DSSApplicationSection() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    district: "",
    skills: [],
  });

  const { data: applicationSettings, isLoading: isSettingsLoading } = useQuery<ApplicationSettings>({
    queryKey: ["applicationSettings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("application_settings").select("*").single();
      if (error) throw error;
      return data;
    },
  });

  const { data: districts, isLoading: isDistrictsLoading } = useQuery<DistrictQuota[]>({
    queryKey: ["districtQuotas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("district_quotas").select("*");
      if (error) throw error;
      return data;
    },
  });

  const isApplicationsOpen = Boolean(
    applicationSettings?.is_open &&
      (!applicationSettings.deadline || new Date() < new Date(applicationSettings.deadline))
  );

  const skillOptions = skills.map((skill) => skill.title);

  const handleFormSubmit = async () => {
    if (isSubmitting) return;

    if (!formData.fullName || !formData.email || !formData.phone || !formData.gender || !formData.district || formData.skills.length === 0 || !paymentFile) {
      alert("Please complete all required fields and upload a payment screenshot before submitting.");
      return;
    }

    if (!isApplicationsOpen) {
      alert("Applications are currently closed.");
      return;
    }

    const selectedDistrict = districts?.find((district) => district.district === formData.district);
    if (!selectedDistrict) {
      alert("Please choose a valid district.");
      return;
    }

    if (selectedDistrict.is_closed) {
      alert("Applications for this district are currently closed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const countResult = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("district", formData.district);

      if (countResult.error) throw countResult.error;
      if (typeof countResult.count === "number" && countResult.count >= selectedDistrict.max_slots) {
        alert("This district quota is full. Please choose another district or check back later.");
        return;
      }

      const paymentUrl = await FileUploadService.uploadFile(paymentFile, "payment_proofs");

      const { error } = await supabase.from("applications").insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        district: formData.district,
        skills: formData.skills,
        payment_proof_url: paymentUrl,
        payment_status: "pending",
        application_date: new Date().toISOString(),
      });

      if (error) throw error;
      setIsSubmitted(true);
      setIsFormOpen(false);
      setFormData({ fullName: "", email: "", phone: "", gender: "", district: "", skills: [] });
      setPaymentFile(null);
    } catch (error) {
      console.error("Error submitting DSS application:", error);
      alert("Unable to submit your application at this time. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-8">
      {isSettingsLoading || isDistrictsLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading application settings...</div>
      ) : !isApplicationsOpen ? (
        <div className="text-center space-y-4">
          <h3 className="font-display text-2xl font-bold">Applications Are Closed</h3>
          <p className="text-muted-foreground">{applicationSettings?.closing_message || "Check back soon for the next application period."}</p>
          <p className="text-sm text-muted-foreground">If you want to apply later, save this page and return when applications reopen.</p>
        </div>
      ) : isSubmitted ? (
        <div className="text-center space-y-4">
          <h3 className="font-display text-2xl font-bold text-emerald-600">Application Submitted</h3>
          <p className="text-muted-foreground">Thank you. Your application has been received and is pending payment confirmation by our team.</p>
          <p className="text-sm text-muted-foreground">Admins will review your payment proof and approve or reject the application from the dashboard.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-display text-2xl font-bold">DSS Application</h3>
            <p className="text-sm text-muted-foreground mt-2">Application Fee: LE {applicationSettings?.application_fee || 250}</p>
            <p className="text-sm text-muted-foreground">A small fee is required to process your application and confirm your seat.</p>
          </div>

          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="district">District</Label>
              <Select
                value={formData.district}
                onValueChange={(value) => setFormData({ ...formData, district: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your district" />
                </SelectTrigger>
                <SelectContent>
                  {districts?.map((district) => (
                    <SelectItem key={district.district} value={district.district}>
                      {district.district} {district.is_closed ? "(closed)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Skills of Interest</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {skillOptions.map((skill) => (
                  <label key={skill} className="cursor-pointer rounded-xl border border-border p-3 flex items-center gap-3 hover:border-primary">
                    <Checkbox
                      id={skill}
                      checked={formData.skills.includes(skill)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, skills: [...formData.skills, skill] });
                        } else {
                          setFormData({ ...formData, skills: formData.skills.filter((option) => option !== skill) });
                        }
                      }}
                    />
                    <span className="text-sm">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="paymentProof">Upload Payment Screenshot</Label>
              <Input
                id="paymentProof"
                type="file"
                accept="image/*"
                onChange={(event) => setPaymentFile(event.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Upload a screenshot of your payment so admins can approve or reject your application.
              </p>
            </div>

            {applicationSettings?.payment_instructions && (
              <Alert>
                <AlertDescription>{applicationSettings.payment_instructions}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button onClick={handleFormSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DSS() {
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);

  const { data: cohorts, isLoading: isLoadingCohorts } = useQuery<Cohort[]>({
    queryKey: ["dssCohorts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cohorts").select("*").order("year", { ascending: false });
      if (error) throw error;
      return data as Cohort[];
    },
  });

  return (
    <Layout>
      <section className="bg-hero min-h-[50vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(25_95%_53%/0.15),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <AnimateOnScroll>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
              <GraduationCap className="h-4 w-4" />
              Digital Skills Scholarship
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4 max-w-3xl">
              Digital Skills Scholarship
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl mb-8">
              Transform Your Future with Free Digital Skills Training
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="hero" asChild>
                <a href="#apply">Apply Now</a>
              </Button>
              <Button size="lg" variant="hero-outline" asChild>
                <a href="#about-dss">Learn More</a>
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

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
            </div>
          </AnimateOnScroll>
        </div>
      </Section>

      <Section alt id="eligibility">
        <SectionHeader badge="Who Can Apply?" title="Eligibility Criteria" description="Make sure you meet the following requirements before applying." />
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Completed high school (or equivalent)",
                "Between 18-25 years old",
                "Cannot afford university education",
                "Motivated to learn digital skills",
                "Available for 6-month training program",
                "Reside in Sierra Leone",
              ].map((item, index) => (
                <AnimateOnScroll key={item} delay={index * 80}>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border card-hover">
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </Section>

      <Section>
        <SectionHeader badge="Skills Covered" title="What You'll Learn" description="Our comprehensive curriculum covers essential digital skills for the modern economy." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, i) => (
            <AnimateOnScroll key={skill.title} delay={i * 80}>
              <div className="p-6 rounded-xl bg-card border border-border card-hover h-full">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <skill.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{skill.title}</h3>
                <p className="text-muted-foreground text-sm">{skill.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </Section>

      <Section id="our-cohorts">
        <SectionHeader badge="Our Cohorts" title="Meet the Cohorts" description="Browse the current and past DSS cohorts with their projects and outcomes." />
        <div className="max-w-6xl mx-auto space-y-6">
          {isLoadingCohorts ? (
            <div className="text-center py-12 text-muted-foreground">Loading cohorts...</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cohorts?.map((cohort) => (
                <AnimateOnScroll key={cohort.id} delay={0}>
                  <Link
                    to={`/cohort/${cohort.slug}`}
                    className="group block rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-1"
                    id={`cohort/${cohort.slug}`}
                    onClick={() => setSelectedCohortId(cohort.slug)}
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Cohort</p>
                        <h3 className="text-xl font-semibold">{cohort.name}</h3>
                      </div>
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {cohort.year || "Current"}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{cohort.description || "A strong cohort of DSS learners and alumni."}</p>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section>
        <SectionHeader badge="DSS Community" title="DSS Community" description="A vibrant community of learners, creators, and future leaders." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityBenefits.map((item, i) => (
            <AnimateOnScroll key={item.title} delay={i * 80}>
              <div className="p-6 rounded-xl bg-card border border-border card-hover h-full">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </Section>

      <Section alt id="apply">
        <SectionHeader badge="Join Us" title="Apply for DSS" description="Ready to start your journey? Apply now through our application section." />
        <div className="max-w-4xl mx-auto">
          <DSSApplicationSection />
        </div>
      </Section>
    </Layout>
  );
}
`;
fs.writeFileSync(path, content, { encoding: 'utf8' });
console.log('done');
