import { Layout } from "@/components/Layout";
import { Section, SectionHeader, AnimateOnScroll } from "@/components/SectionComponents";
import { Palette, Code, Smartphone, TrendingUp, Video, Camera, Settings } from "lucide-react";

const services = [
  { icon: Palette, title: "Graphic Design", desc: "Professional brand identities, logos, flyers, social media graphics, and marketing materials that make your brand stand out." },
  { icon: Code, title: "Web Development", desc: "Modern, responsive websites and web applications built with the latest technologies for optimal performance." },
  { icon: Smartphone, title: "App Development", desc: "Cross-platform mobile applications designed for seamless user experience and scalable architecture." },
  { icon: TrendingUp, title: "Digital Marketing", desc: "Comprehensive digital marketing strategies including SEO, social media management, and content marketing." },
  { icon: Video, title: "Videography", desc: "Professional video production, editing, and motion graphics for promotional content and storytelling." },
  { icon: Camera, title: "Photography", desc: "High-quality photography services for events, products, portraits, and commercial projects." },
  { icon: Settings, title: "Tech Consultancy", desc: "Strategic technology consulting to help businesses adopt the right tools, systems, and digital strategies." },
];

export default function Services() {
  return (
    <Layout>
      <section className="bg-hero min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,hsl(25_95%_53%/0.12),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <AnimateOnScroll>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">Services</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4 max-w-2xl">
              Technology Solutions for Africa's Growth
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl">
              End-to-end digital services designed to help businesses and individuals thrive in the digital economy.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <AnimateOnScroll key={service.title} delay={i * 80}>
              <div className="bg-card rounded-xl p-8 border border-border card-hover group h-full">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </Section>
    </Layout>
  );
}
