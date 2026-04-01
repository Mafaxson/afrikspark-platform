import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Section, SectionHeader, AnimateOnScroll, StatCounter } from "@/components/SectionComponents";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { ArrowRight, Sparkles, Code, Palette, Video, TrendingUp, Users, Globe } from "lucide-react";

const services = [
  { icon: Palette, title: "Graphic Design", desc: "Brand identities, marketing materials, and visual storytelling." },
  { icon: Code, title: "Web & App Development", desc: "Modern, scalable web and mobile applications." },
  { icon: Video, title: "Videography & Photography", desc: "Professional content creation and visual media." },
  { icon: TrendingUp, title: "Digital Marketing", desc: "Growth strategies, social media, and SEO optimization." },
  { icon: Users, title: "Tech Consultancy", desc: "Strategic technology guidance for businesses." },
  { icon: Sparkles, title: "Innovation Programs", desc: "Venture studio and startup incubation support." },
];

const stats = [
  { value: "50+", label: "Youth Trained" },
  { value: "200+", label: "Students Developed" },
  { value: "1000+", label: "Community Members" },
  { value: "3+", label: "Innovation Projects" },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-hero relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(25_95%_53%/0.15),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <AnimateOnScroll>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
                <Sparkles className="h-4 w-4" />
                Empowering Africa's Digital Future
              </span>
            </AnimateOnScroll>
            <AnimateOnScroll delay={100}>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-primary-foreground">
                Empowering Africa Through{" "}
                <span className="text-gradient">Digital Skills</span> and Technology
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
              <p className="text-lg md:text-xl text-primary-foreground/70 max-w-xl mb-8 leading-relaxed">
                AfrikSpark Tech Solutions empowers young people and businesses with digital skills, technology solutions, and innovation programs.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll delay={300}>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/services">
                    Explore Our Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <Link to="/dss">Apply for Digital Skills Scholarship</Link>
                </Button>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Stats */}
      <Section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <AnimateOnScroll key={stat.label} delay={i * 100}>
              <StatCounter value={stat.value} label={stat.label} />
            </AnimateOnScroll>
          ))}
        </div>
      </Section>

      {/* Services Preview */}
      <Section alt>
        <SectionHeader
          badge="What We Do"
          title="Our Services"
          description="From design to development, we provide end-to-end technology solutions for Africa's digital transformation."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <AnimateOnScroll key={service.title} delay={i * 80}>
              <div className="bg-card rounded-xl p-6 border border-border card-hover group">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline" asChild>
            <Link to="/services">View All Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA */}
      <Section>
        <div className="bg-hero rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(25_95%_53%/0.2),transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Your Digital Journey?
            </h2>
            <p className="text-primary-foreground/70 max-w-lg mx-auto mb-8">
              Apply for our Digital Skills Scholarship or explore partnership opportunities.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/dss">Apply for DSS</Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
