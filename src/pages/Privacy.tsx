import { Layout } from "@/components/Layout";
import { Section } from "@/components/SectionComponents";

export default function Privacy() {
  return (
    <Layout>
      <section className="bg-hero min-h-[40vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(25_95%_53%/0.12),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">Legal</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Privacy Policy</h1>
            <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto">
              How we protect and handle your personal information.
            </p>
          </div>
        </div>
      </section>

      <Section>
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2>AfrikSpark Tech Solutions</h2>
          <p>Respects your privacy and is committed to protecting the personal information of our users, partners, and community members.</p>

          <h3>Information We Collect</h3>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Organization name</li>
            <li>Country</li>
            <li>Contact messages</li>
            <li>Application details submitted through our forms</li>
          </ul>

          <p>This information is collected when users:</p>
          <ul>
            <li>Apply for partnerships or sponsorships</li>
            <li>Submit Venture Studio applications</li>
            <li>Contact us through our contact form</li>
            <li>Subscribe to our newsletter</li>
          </ul>

          <h3>How We Use Your Information</h3>
          <p>We use the collected information to:</p>
          <ul>
            <li>Respond to inquiries</li>
            <li>Evaluate partnership and venture applications</li>
            <li>Send newsletters and updates</li>
            <li>Improve our services and programs</li>
            <li>Communicate with users about opportunities and programs</li>
          </ul>

          <h3>Data Storage and Security</h3>
          <p>User data is securely stored using trusted technology platforms. We take reasonable technical and organizational measures to protect personal information from unauthorized access or misuse.</p>

          <h3>Sharing of Information</h3>
          <p>AfrikSpark Tech Solutions does not sell or rent personal data to third parties. Information may only be shared with trusted partners when necessary to operate programs or services.</p>

          <h3>Cookies and Analytics</h3>
          <p>Our website may use basic analytics tools to understand website traffic and improve user experience.</p>

          <h3>Your Rights</h3>
          <p>Users may request to access, update, or delete their personal information by contacting us directly.</p>

          <h3>Contact</h3>
          <p>If you have any questions about this Privacy Policy, you can contact us through the contact page on our website.</p>
        </div>
      </Section>
    </Layout>
  );
}