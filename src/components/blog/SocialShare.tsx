import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Linkedin, Link, MessageCircle, Twitter } from "lucide-react";
import { toast } from "sonner";

interface SocialShareProps {
  title: string;
  url: string;
}

export function SocialShare({ title, url }: SocialShareProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const shareUrl = url;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch (error) {
        console.error("Native share failed:", error);
      }
      return;
    }

    setMenuOpen((prev) => !prev);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
      setMenuOpen(false);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy link");
    }
  };

  const openShareTarget = (targetUrl: string) => {
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    setMenuOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
        <MessageCircle className="h-4 w-4" />
        Share
      </Button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-background p-3 shadow-lg">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
            onClick={() => openShareTarget(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`)}
          >
            <Link className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
            onClick={() => openShareTarget(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`)}
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
            onClick={() => openShareTarget(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`)}
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
            onClick={copyLink}
          >
            <Copy className="h-4 w-4" />
            Copy link
          </Button>
        </div>
      )}
    </div>
  );
}
