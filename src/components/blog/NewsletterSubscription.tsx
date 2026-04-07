import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { AnimateOnScroll } from "@/components/SectionComponents";

export function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      alert("Please enter a valid email address");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email }]);

    if (error) {
      console.error(error.message);
      alert(error.message);
    } else {
      alert("Subscribed successfully!");
      setEmail("");
    }

    setLoading(false);
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
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="md:w-64"
              />
              <Button onClick={handleSubscribe} disabled={loading}>
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimateOnScroll>
  );
}
