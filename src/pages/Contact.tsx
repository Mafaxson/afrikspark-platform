import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Section, AnimateOnScroll } from "@/components/SectionComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter, Youtube, Linkedin, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const subject = formData.get("subject") as string;
      const message = formData.get("message") as string;

      const { error } = await supabase.from("contact_messages").insert({ name, email, subject, message });

      if (error) {
        console.error("Contact form error:", error);
        toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
        return;
      }

      toast({ title: "Message Sent!", description: "Your message has been sent successfully." });
      form.reset();

      // Notify admin (don't wait for this)
      supabase.functions.invoke("send-notification", {
        body: { type: "contact", data: { name, email, message } }
      }).catch((emailError) => {
        console.error("Failed to send admin notification:", emailError);
        // Don't show error to user since message was saved
      });

    } catch (error) {
      console.error("Unexpected error:", error);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="bg-hero min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(25_95%_53%/0.12),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <AnimateOnScroll>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">Contact</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Get in Touch</h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl">Have questions? We'd love to hear from you.</p>
          </AnimateOnScroll>
        </div>
      </section>

      <Section>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="space-y-6">
            <AnimateOnScroll>
              <h2 className="font-display text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: "Location", value: "Sierra Leone" },
                  { icon: Mail, label: "Email", value: "info@afrikspark.tech" },
                  { icon: Phone, label: "Phone", value: "+232 77 299 080" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={50}>
              <h3 className="font-display text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4 items-center">
                <a href="https://www.instagram.com/afriksparktech?igsh=MXEwbzluODl6b2Zqaw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">
                  <Instagram className="text-xl text-muted-foreground hover:text-pink-500 hover:scale-110 transition" />
                </a>
                <a href="https://www.facebook.com/share/1GR8UUXcDb/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                  <Facebook className="text-xl text-muted-foreground hover:text-blue-600 hover:scale-110 transition" />
                </a>
                <a href="https://www.linkedin.com/company/afrikspark-tech-solutions/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="text-xl text-muted-foreground hover:text-blue-500 hover:scale-110 transition" />
                </a>
                <a href="https://x.com/afriksparktech1?s=21" target="_blank" rel="noopener noreferrer">
                  <Twitter className="text-xl text-muted-foreground hover:text-gray-400 hover:scale-110 transition" />
                </a>
                <a href="https://www.youtube.com/@AfrikSparkTechSolutions" target="_blank" rel="noopener noreferrer">
                  <Youtube className="text-xl text-muted-foreground hover:text-red-500 hover:scale-110 transition" />
                </a>
                <a href="https://wa.me/23277299080" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="text-xl text-muted-foreground hover:text-green-500 hover:scale-110 transition" />
                </a>
              </div>
            </AnimateOnScroll>
          </div>

          <div className="md:col-span-2">
            <AnimateOnScroll delay={100}>
              <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 border border-border space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Name</label>
                    <Input name="name" required placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <Input name="email" type="email" required placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Subject</label>
                  <Input name="subject" required placeholder="Subject" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message</label>
                  <Textarea name="message" required placeholder="Your message..." rows={5} />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </AnimateOnScroll>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
