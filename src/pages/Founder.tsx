import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Section, AnimateOnScroll } from "@/components/SectionComponents";
import { User } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
}

export default function Founder() {
  const { data: founder, isLoading } = useQuery({
    queryKey: ['founder'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('name', 'Ishmeal Kamara')
        .single();

      if (error) {
        console.error('Error fetching founder:', error);
        return null;
      }
      return data as TeamMember;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <Layout>
      <Helmet>
        <title>Ishmeal Kamara - Founder & CEO of AfrikSpark Tech Solutions</title>
        <meta name="description" content="Meet Ishmeal Kamara, founder of AfrikSpark Tech Solutions. From resilience to innovation - discover the inspiring story behind Sierra Leone's youth empowerment movement." />
        <meta name="keywords" content="Ishmeal Kamara, AfrikSpark founder, CEO, Sierra Leone entrepreneur, youth empowerment, digital skills, founder story" />
        <meta property="og:title" content="Ishmeal Kamara - Founder & CEO of AfrikSpark Tech Solutions" />
        <meta property="og:description" content="The inspiring journey of Ishmeal Kamara from overcoming adversity to building Africa's leading youth empowerment platform." />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ishmeal Kamara - AfrikSpark Founder" />
        <meta name="twitter:description" content="Founder story of Sierra Leone's digital skills revolution." />
      </Helmet>
      {/* Hero */}
      <section className="bg-hero min-h-[50vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,hsl(25_95%_53%/0.12),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <AnimateOnScroll>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">Founder Story</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4 max-w-2xl">
              Meet Ishmeal Kamara
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl">
              Founder & CEO of AfrikSpark Tech Solutions
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Founder Profile */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Founder Image */}
            <div className="lg:col-span-1">
              <AnimateOnScroll>
                <div className="bg-card rounded-xl p-8 border border-border text-center">
                  <div className="h-48 w-48 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 overflow-hidden">
                    {founder?.image_url ? (
                      <img
                        src={founder.image_url}
                        alt={founder.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <User className="h-24 w-24 text-primary" />
                    )}
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-2">{founder?.name || 'Ishmeal Kamara'}</h2>
                  <p className="text-primary font-medium">{founder?.role || 'Founder & CEO'}</p>
                </div>
              </AnimateOnScroll>
            </div>

            {/* Founder Story */}
            <div className="lg:col-span-2">
              <AnimateOnScroll>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">The Journey</span>
                <h2 className="font-display text-3xl font-bold mb-6">Founder Story – Ishmeal Kamara</h2>
                <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-4">
                  <p>
                    Ishmeal Kamara is the Founder of AfrikSpark Tech Solutions, a youth-focused technology and digital skills organization committed to creating opportunities for young people across Sierra Leone and Africa.
                  </p>

                  <p>
                    His journey is not one of privilege, but of survival, resilience, and determination.
                  </p>

                  <p>
                    Ishmeal lost his mother at the age of 2 and his father at the age of 12. Growing up without financial support, he had to find ways to survive from a very young age. While still in school, he engaged in small trading activities, selling items such as cold water, clothes, and kola nuts just to meet basic needs and continue his education.
                  </p>

                  <p>
                    After completing high school in 2023, he faced a major reality—he had no financial means to pursue university education. However, he quickly realized that his situation was not unique. Thousands of young people across Sierra Leone graduate every year without access to higher education or employable skills, leaving them vulnerable to unemployment, hardship, and risky life choices.
                  </p>

                  <p>
                    Instead of giving up, Ishmeal chose a different path.
                  </p>

                  <p>
                    He began teaching himself digital skills using available tools and online resources. Through consistency and self-learning, he developed skills in graphic design, digital marketing, and technology. He later started earning small income through freelancing, proving to himself that digital skills could create real economic opportunities without a university degree.
                  </p>

                  <p>
                    This experience changed his perspective completely.
                  </p>

                  <p>
                    He realized that if he could learn and earn through digital skills, then thousands of other young people could do the same—if only they had access and guidance.
                  </p>

                  <p>
                    This realization led to the creation of AfrikSpark Tech Solutions.
                  </p>

                  <p>
                    AfrikSpark was founded to bridge the gap between education, skills, and opportunity. The goal was simple but powerful: to create a system where young people can learn practical digital skills, earn income, and build solutions that address real challenges in their communities.
                  </p>

                  <p>
                    Today, AfrikSpark Tech Solutions operates across multiple areas including digital skills training, technology services, and innovation-driven projects. Through its flagship Digital Skills Scholarship (DSS), the organization continues to empower young people with the tools they need to transform their lives.
                  </p>

                  <p>
                    Ishmeal's story is a reflection of what is possible when resilience meets opportunity—and his mission is to ensure that many more young people get that same chance.
                  </p>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}