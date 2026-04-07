import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Mail, X } from "lucide-react";

export function PopupNewsletter() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const shown = localStorage.getItem("newsletter_shown");
    if (!shown) {
      setTimeout(() => setOpen(true), 3000);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("newsletter_shown", "true");
    setOpen(false);
  };

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
      handleClose();
    }

    setLoading(false);
  };

  const handleMaybeLater = () => {
    setOpen(false);
    // Don't set localStorage here so modal appears again on next visit
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Join Our Community
          </DialogTitle>
          <DialogClose asChild>
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Subscribe to get updates on DSS, opportunities, and insights.
          </p>

          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubscribe();
                }
              }}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
              <Button
                variant="outline"
                onClick={handleMaybeLater}
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
