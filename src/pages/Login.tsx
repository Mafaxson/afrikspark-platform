import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Section, AnimateOnScroll } from "@/components/SectionComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, isAdmin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Unknown error",
          variant: "destructive",
        });
      } else {
        toast({ title: "Welcome back!" });
        // Navigation will be handled by auth state change in AuthContext
        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/community");
        }
      }
    } else {
      const { error } = await signUp(email, password, { full_name: name });
      if (error) {
        toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account Created!", description: "Check your email to confirm your account." });
        // Notify admin of new signup
        supabase.functions.invoke("notify-admin", { body: { type: "new_signup", data: { name, email } } });
      }
    }
    setLoading(false);
  };

  return (
    <Layout>
      <Section className="min-h-[80vh] flex items-center">
        <div className="max-w-md mx-auto w-full">
          <AnimateOnScroll>
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin ? "Sign in to access the community and dashboard." : "Join the AfrikSpark community."}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 border border-border space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </form>
          </AnimateOnScroll>
        </div>
      </Section>
    </Layout>
  );
}