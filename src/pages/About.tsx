import { Layout } from "@/components/Layout";
import { Section, SectionHeader, AnimateOnScroll } from "@/components/SectionComponents";
import { Target, Eye, Heart, Lightbulb, Users, Shield } from "lucide-react";
import { Helmet } from "react-helmet-async";

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
      <Helmet>
        <title>About AfrikSpark Tech Solutions - Digital Skills Scholarship Sierra Leone</title>
        <meta name="description" content="AfrikSpark Tech Solutions empowers underprivileged youth with digital and entrepreneurial skills. Founded by Ishmeal Kamara, we provide practical training in graphic design, freelancing, and digital marketing across Sierra Leone." />
        <meta name="keywords" content="AfrikSpark Tech Solutions, Digital Skills Scholarship, Sierra Leone, youth empowerment, digital skills training, Ishmeal Kamara, graphic design, freelancing, digital marketing" />
        <meta property="og:title" content="About AfrikSpark Tech Solutions - Digital Skills Scholarship Sierra Leone" />
        <meta property="og:description" content="Empowering underprivileged youth with digital and entrepreneurial skills across Africa. Founded in Sierra Leone by Ishmeal Kamara." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About AfrikSpark Tech Solutions" />
        <meta name="twitter:description" content="Youth-focused technology company providing digital skills training and innovation solutions in Sierra Leone." />
      </Helmet>
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
              AfrikSpark Tech Solutions is a youth-focused technology, education, and innovation company based in Sierra Leone, founded by Ishmeal Kamara with a clear mission to solve one of Africa's most urgent challenges: the gap between education, skills, and real opportunity.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Story */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">Our Story</span>
            <h2 className="font-display text-3xl font-bold mb-6">Built from lived experience rather than theory</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-4">
              <p>
                AfrikSpark Tech Solutions is a youth-focused technology, education, and innovation company based in Sierra Leone, founded by Ishmeal Kamara with a clear mission to solve one of Africa's most urgent challenges: the gap between education, skills, and real opportunity. Built from lived experience rather than theory, AfrikSpark exists to empower young people with practical digital skills, connect them to income opportunities, and support them in building solutions that transform their communities and economies.
              </p>

              <p>
                The story of AfrikSpark Tech Solutions begins not in privilege, but in resilience. Ishmeal Kamara lost his mother at the age of two and his father at the age of twelve, growing up without financial stability or structured support. From a young age, survival required action. While attending school, he engaged in small-scale trading—selling cold water, clothes, and kola nuts—just to meet daily needs and continue his education. After completing high school in 2023, he encountered a reality faced by thousands of young Sierra Leoneans: the inability to afford university education. But what appeared to be a dead end became a turning point.
              </p>

              <p>
                Instead of giving in to limitation, Ishmeal turned to self-education. Through persistence, curiosity, and access to digital tools, he began learning skills such as graphic design, digital marketing, and online freelancing. Over time, he started earning small but meaningful income, proving that digital skills could create real economic opportunities even without formal higher education. This personal breakthrough revealed a powerful truth—if one young person could learn, earn, and grow through digital skills, then thousands more could do the same if given access, structure, and guidance.
              </p>

              <p>
                AfrikSpark Tech Solutions was founded to turn that realization into a scalable solution. Today, the organization operates as a mission-driven platform that combines digital skills training, technology services, and innovation development to create a complete pathway for youth empowerment. At its core is the Digital Skills Scholarship (DSS), the flagship program designed for young people who have completed high school but lack access to further education. Through this program, participants receive hands-on training in areas such as graphic design, freelancing, digital marketing, and content creation. More importantly, the program goes beyond training by teaching participants how to monetize their skills, connecting them to real platforms and opportunities, and supporting them through a long-term alumni community that ensures continuous growth and guidance.
              </p>

              <p>
                To date, AfrikSpark has trained over 200+ youth between 2024 and 2025, with an ambitious goal of training 600 youth in 2026 across Freetown, Bo, Kenema, and Makeni.
              </p>

              <p>
                AfrikSpark also provides professional technology services including graphic design, web and app development, digital marketing, and media production. This creates sustainability while generating real job opportunities for trained youth.
              </p>

              <p>
                The organization is also building impactful solutions such as Citizens Voice, GreenBin Connect, and an upcoming fintech platform, all designed to solve real problems in society.
              </p>

              <p>
                Through its Venture Studio, AfrikSpark identifies talented individuals and supports them in building startups through mentorship, business support, and funding, with a goal of building 100 startups.
              </p>

              <p>
                AfrikSpark Tech Solutions was founded in 2024 in Sierra Leone and has trained over 200+ youth while building multiple impactful projects. Its mission is to empower underprivileged youth with digital and entrepreneurial skills. Its vision is to build a digitally empowered generation across Africa. Its core values include empowerment, accessibility, innovation, community impact, and integrity.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </Section>

      {/* Statistics */}
      <Section alt>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <AnimateOnScroll>
            <div className="text-center p-6 bg-card rounded-xl border border-border">
              <div className="font-display text-3xl font-bold text-gradient mb-2">2024</div>
              <div className="text-sm text-muted-foreground">Founded</div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <div className="text-center p-6 bg-card rounded-xl border border-border">
              <div className="font-display text-3xl font-bold text-gradient mb-2">200+</div>
              <div className="text-sm text-muted-foreground">Youth Trained</div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <div className="text-center p-6 bg-card rounded-xl border border-border">
              <div className="font-display text-3xl font-bold text-gradient mb-2">100</div>
              <div className="text-sm text-muted-foreground">Startups Goal (2026)</div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={300}>
            <div className="text-center p-6 bg-card rounded-xl border border-border">
              <div className="font-display text-3xl font-bold text-gradient mb-2">3+</div>
              <div className="text-sm text-muted-foreground">Projects Built</div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={400}>
            <div className="text-center p-6 bg-card rounded-xl border border-border col-span-2 md:col-span-1">
              <div className="font-display text-lg font-bold text-gradient mb-2">4 Cities</div>
              <div className="text-sm text-muted-foreground">Freetown, Bo, Kenema, Makeni</div>
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
