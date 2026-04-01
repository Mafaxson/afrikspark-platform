import { Layout } from "@/components/Layout";
import { Section, SectionHeader, AnimateOnScroll } from "@/components/SectionComponents";
import { Target, Eye, Heart, Lightbulb, Users, Shield } from "lucide-react";

const values = [
  { icon: Heart, title: "Empowerment", desc: "We equip individuals with the knowledge and skills needed to transform their future." },
  { icon: Lightbulb, title: "Accessibility", desc: "We make digital skills and technology opportunities accessible to those who would otherwise be excluded." },
  { icon: Target, title: "Innovation", desc: "We encourage creativity and the use of technology to solve real-world problems." },
  { icon: Users, title: "Community Impact", desc: "Our work focuses on improving the lives of communities." },
  { icon: Shield, title: "Integrity", desc: "We operate with honesty, transparency, and accountability." },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-hero min-h-[50vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,hsl(25_95%_53%/0.12),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <AnimateOnScroll>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">About Us</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4 max-w-2xl">
              ABOUT AfrikSpark Tech Solutions
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl">
              AfrikSpark Tech Solutions was founded by Ishmeal Kamara, a young Sierra Leonean entrepreneur who experienced firsthand the challenges many young people face after completing high school.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Story */}
      <Section>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <AnimateOnScroll>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">Our Story</span>
            <h2 className="font-display text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              AfrikSpark Tech Solutions was founded by Ishmeal Kamara, a young Sierra Leonean entrepreneur who experienced firsthand the challenges many young people face after completing high school.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Growing up, Ishmeal faced significant hardship, including losing both parents at a young age. With limited access to formal opportunities, he had to find alternative ways to learn and survive. During this period, he began teaching himself digital skills using online resources and practical experimentation.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Over time, he developed knowledge in digital marketing, technology tools, and entrepreneurship.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              While working as a marketer and volunteering with local organizations, he noticed a recurring problem in his community: thousands of young people complete secondary school but cannot afford university education or professional training.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As a result, many talented young people remain unemployed or underemployed despite having the potential to succeed.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Seeing this gap between education, skills, and opportunity, Ishmeal founded AfrikSpark Tech Solutions to create a pathway where young people could gain practical digital skills, access opportunities, and use technology to solve real problems in their communities.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Today, AfrikSpark Tech Solutions operates as a mission-driven technology and digital skills organization that combines training, innovation, and technology services to empower individuals and businesses.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <div className="bg-section-alt rounded-2xl p-8 border border-border">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="font-display text-3xl font-bold text-gradient">2024</div>
                  <div className="text-sm text-muted-foreground mt-1">Founded</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-gradient">SL</div>
                  <div className="text-sm text-muted-foreground mt-1">Sierra Leone</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-gradient">50+</div>
                  <div className="text-sm text-muted-foreground mt-1">Youth Trained</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-gradient">3+</div>
                  <div className="text-sm text-muted-foreground mt-1">Projects</div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section alt>
        <div className="grid md:grid-cols-2 gap-8">
          <AnimateOnScroll>
            <div className="bg-card rounded-xl p-8 border border-border h-full">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our mission is to empower underprivileged youth in Sierra Leone and across Africa with practical digital and entrepreneurial skills that enable them to earn income, build careers, and develop technology-driven solutions for real-world challenges.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                We believe that access to digital knowledge can transform lives and communities.
              </p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <div className="bg-card rounded-xl p-8 border border-border h-full">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our vision is to build a digitally skilled and empowered generation of young Africans who use innovation, creativity, and technology to transform their communities and economies.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                AfrikSpark aims to become a platform where young people gain skills, launch ideas, and develop solutions that address the challenges facing Africa.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </Section>

      {/* Core Values */}
      <Section>
        <SectionHeader badge="Our Principles" title="Core Values" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {values.map((value, i) => (
            <AnimateOnScroll key={value.title} delay={i * 100}>
              <div className="text-center p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </Section>
    </Layout>
  );
}
