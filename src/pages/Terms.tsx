import { Layout } from "@/components/Layout";
import { Section } from "@/components/SectionComponents";

export default function Terms() {
  return (
    <Layout>
      <section className="bg-hero min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(25_95%_53%/0.12),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">Legal</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Terms of Service</h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
              Terms and conditions for using our services.
            </p>
          </div>
        </div>
      </section>

      <Section>
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2>Terms of Service</h2>

          <h3>Acceptance of Terms</h3>
          <p>By accessing or using the AfrikSpark Tech Solutions website, you agree to comply with these Terms of Service.</p>

          <h3>Use of the Website</h3>
          <p>Users agree to use the website responsibly and not engage in activities that may harm the platform, its users, or its services.</p>

          <h3>Programs and Applications</h3>
          <p>AfrikSpark offers programs including partnerships, venture studio opportunities, and digital training initiatives. Submission of an application does not guarantee acceptance.</p>

          <h3>Intellectual Property</h3>
          <p>All content on this website, including text, graphics, and branding, belongs to AfrikSpark Tech Solutions unless otherwise stated.</p>

          <h3>External Links</h3>
          <p>Our website may contain links to external websites operated by partners or third parties. AfrikSpark is not responsible for the content or practices of those external sites.</p>

          <h3>Limitation of Liability</h3>
          <p>AfrikSpark Tech Solutions will not be liable for any damages resulting from the use or inability to use the website or its services.</p>

          <h3>Changes to Terms</h3>
          <p>We may update these Terms of Service from time to time. Continued use of the website indicates acceptance of the updated terms.</p>

          <h3>Contact</h3>
          <p>If you have questions regarding these Terms of Service, please contact us through the website.</p>
        </div>
      </Section>
    </Layout>
  );
}