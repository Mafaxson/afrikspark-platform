import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { AnimateOnScroll } from "@/components/SectionComponents";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");

export function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate email
      emailSchema.parse(email);

      setLoading(true);
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.toLowerCase().trim() });

      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already subscribed");
        } else {
          throw error;
        }
      } else {
        toast.success("Successfully subscribed to newsletter!");
        setEmail("");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error subscribing:", error);
        toast.error("Failed to subscribe. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimateOnScroll>
      <Card className="my-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h3>
              <p className="text-muted-foreground">
                Get the latest articles and updates delivered to your inbox weekly
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="md:w-64"
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </AnimateOnScroll>
  );
}
