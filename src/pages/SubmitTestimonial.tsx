import { Layout } from "@/components/Layout";
import { SubmitTestimonialForm } from "@/components/testimonials/SubmitTestimonialForm";
import { Section } from "@/components/SectionComponents";
import { motion } from "framer-motion";

const SubmitTestimonial = () => {
  return (
    <Layout>
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Share Your Success Story
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your story can inspire and encourage others in our community. Tell us about your experience with AfrikSpark and how it has impacted your journey.
          </p>
        </motion.div>

        <SubmitTestimonialForm />
      </Section>
    </Layout>
  );
};

export default SubmitTestimonial;
