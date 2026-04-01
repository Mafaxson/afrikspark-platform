import { Layout } from "@/components/Layout";
import { Section, SectionHeader, AnimateOnScroll } from "@/components/SectionComponents";
import { Handshake, Award, Users, Lightbulb } from "lucide-react";
import { PartnershipApplicationForm } from "@/components/partnership/PartnershipApplicationForm";
import { PartnersSponsorsSection } from "@/components/partnership/PartnersSponsorsSection";

const benefits = [
  { icon: Award, title: "Brand Visibility", desc: "Showcase your brand across our programs and platforms." },
  { icon: Users, title: "Community Impact", desc: "Direct recognition for empowering youth in Africa." },
  { icon: Lightbulb, title: "Access to Talent", desc: "Connect with skilled and motivated young digital professionals." },
  { icon: Handshake, title: "Innovation Programs", desc: "Participate in technology projects driving social change." },
];

export default function Partners() {

  return (
    <Layout>
      <section className="bg-hero min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(25_95%_53%/0.12),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <AnimateOnScroll>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">Partnerships</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Partner With AfrikSpark</h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl">
              Work with us to empower young people with digital skills and innovation opportunities.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <PartnersSponsorsSection />

      <Section>
        <SectionHeader badge="Why Partner" title="Sponsor Benefits" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <AnimateOnScroll key={b.title} delay={i * 80}>
              <div className="text-center p-6 bg-card rounded-xl border border-border card-hover">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </Section>

      <Section alt id="partner-form">
        <SectionHeader badge="Apply Now" title="Become a Partner or Sponsor" />
        <PartnershipApplicationForm />
      </Section>
    </Layout>
  );
}
