import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Section, SectionHeader, AnimateOnScroll } from "@/components/SectionComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Rocket, Lightbulb, Code, DollarSign, Users, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadService } from "@/lib/uploadService";

const offerings = [
  { icon: Users, title: "Mentorship", desc: "One-on-one guidance from experienced founders and tech leaders." },
  { icon: Code, title: "Technical Support", desc: "Help building MVPs, prototypes, and scalable products." },
  { icon: Lightbulb, title: "Product Development", desc: "Strategic guidance on product-market fit and user research." },
  { icon: DollarSign, title: "Funding Access", desc: "Connections to investors, grants, and funding opportunities." },
];

interface ApprovedStartup {
  id: string;
  name: string;
  website?: string;
  logo_url?: string;
}

export default function VentureStudio() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [approvedStartups, setApprovedStartups] = useState<ApprovedStartup[]>([]);

  useEffect(() => {
    fetchApprovedStartups();
  }, []);

  const fetchApprovedStartups = async () => {
    try {
      const { data, error } = await supabase
        .from("startups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching startups:", error);
        return;
      }

      setApprovedStartups((data || []) as ApprovedStartup[]);
    } catch (error) {
      console.error("Unexpected error fetching startups:", error);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Logo must be less than 5MB", variant: "destructive" });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;

    try {
      const result = await FileUploadService.uploadFile(logoFile, "venture");
      return result.url;
    } catch (error) {
      console.error("Logo upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      const applicationData = {
        startup_name: (formData.get("startup_name") as string).trim(),
        founder_name: (formData.get("founder_name") as string).trim(),
        email: (formData.get("email") as string).trim(),
        website: (formData.get("website") as string)?.trim() || null,
        description: (formData.get("description") as string).trim(),
        logo_url: logoUrl,
      };

      const { error } = await supabase.from("startup_applications").insert(applicationData);

      if (error) {
        console.error("Startup application error:", error);
        toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
        return;
      }

      toast({ title: "Application Submitted!", description: "Your startup application has been submitted successfully." });
      form.reset();
      setLogoFile(null);
      setLogoPreview(null);

      // Send email notification
      try {
        const { error: emailError } = await supabase.functions.invoke("send-notification", {
          body: {
            type: "startup",
            data: applicationData,
          },
        });

        if (emailError) {
          console.error("Failed to send email notification:", emailError);
        }
      } catch (emailError) {
        console.error("Email notification error:", emailError);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="bg-hero min-h-[50vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,hsl(25_95%_53%/0.15),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <AnimateOnScroll>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
              <Rocket className="h-4 w-4" />
              Venture Studio
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4 max-w-3xl">
              AfrikSpark <span className="text-gradient">Venture Studio</span>
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl">
              Supporting young innovators and startups developing solutions to real-world challenges across Africa.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <Section>
        <SectionHeader badge="What We Provide" title="Startup Support" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerings.map((o, i) => (
            <AnimateOnScroll key={o.title} delay={i * 80}>
              <div className="bg-card rounded-xl p-6 border border-border card-hover text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <o.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{o.title}</h3>
                <p className="text-sm text-muted-foreground">{o.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </Section>

      <Section alt>
        <SectionHeader badge="Apply" title="Submit Your Startup" />
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 border border-border space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Founder Name *</label>
                <Input name="founder_name" required placeholder="Your full name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Startup Name *</label>
                <Input name="startup_name" required placeholder="Your startup name" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Email *</label>
              <Input name="email" type="email" required placeholder="your@email.com" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Website</label>
              <Input name="website" type="url" placeholder="https://yourstartup.com" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Startup Logo</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition"
                onClick={() => document.getElementById('logo-upload')?.click()}>
                {logoPreview ? (
                  <div className="space-y-2">
                    <img src={logoPreview} alt="Logo preview" className="h-20 w-20 object-cover mx-auto rounded" />
                    <p className="text-sm text-muted-foreground">Click to change logo</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Drop your logo or click to select</p>
                    <p className="text-xs text-muted-foreground">Max 5MB • JPG, PNG, WebP</p>
                  </div>
                )}
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Startup Description *</label>
              <Textarea
                name="description"
                required
                placeholder="Tell us about your startup, problem you're solving, solution, and why you're building it..."
                rows={4}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </Section>

      {approvedStartups.length > 0 && (
        <Section>
          <SectionHeader badge="Our Portfolio" title="Approved Startups" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedStartups.map((startup) => (
              <AnimateOnScroll key={startup.id}>
                <div className="bg-card rounded-xl p-6 border border-border card-hover flex flex-col items-center text-center h-full">
                  {startup.logo_url && (
                    <img
                      src={startup.logo_url}
                      alt={startup.name}
                      className="h-24 w-24 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="font-display font-semibold mb-2">{startup.name}</h3>
                  {startup.website && (
                    <a
                      href={startup.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
                    >
                      Visit Website
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </Section>
      )}
    </Layout>
  );
}
