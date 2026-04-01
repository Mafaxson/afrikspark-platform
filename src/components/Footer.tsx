import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter, Youtube, Linkedin, MessageCircle } from "lucide-react";
import logo from "@/assets/afrikspark-logo.jpeg";

const footerLinks = {
  Company: [
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Projects", path: "/projects" },
    { label: "Testimonies", path: "/testimonials" },
    { label: "Partners", path: "/partners" },
  ],
  Programs: [
    { label: "Digital Skills Scholarship", path: "/dss" },
    { label: "Venture Studio", path: "/venture-studio" },
    { label: "Community", path: "/community" },
    { label: "Blog", path: "/blog" },
  ],
  Legal: [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <img src={logo} alt="AfrikSpark Tech Solutions" className="h-10 w-auto mb-4 rounded" />
            <p className="text-background/80 font-medium text-sm mb-1">Tech · Branding · Consultancy</p>
            <p className="text-background/60 text-sm leading-relaxed mb-6">
              We teach digital skills, help people earn, and provide tech solutions to grow businesses and solve real-world challenges.
            </p>
            <div className="flex flex-col gap-2 text-sm text-background/60">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Sierra Leone
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                info@afrikspark.tech
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                +232 77 299 080
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-background/40">
                {title}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-background/60 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/40">
            © {new Date().getFullYear()} AfrikSpark Tech Solutions. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/afriksparktech?igsh=MXEwbzluODl6b2Zqaw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">
              <Instagram className="text-xl text-background/60 hover:text-pink-500 hover:scale-110 transition" />
            </a>
            <a href="https://www.facebook.com/share/1GR8UUXcDb/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
              <Facebook className="text-xl text-background/60 hover:text-blue-600 hover:scale-110 transition" />
            </a>
            <a href="https://www.linkedin.com/company/afrikspark-tech-solutions/" target="_blank" rel="noopener noreferrer">
              <Linkedin className="text-xl text-background/60 hover:text-blue-500 hover:scale-110 transition" />
            </a>
            <a href="https://x.com/afriksparktech1?s=21" target="_blank" rel="noopener noreferrer">
              <Twitter className="text-xl text-background/60 hover:text-gray-400 hover:scale-110 transition" />
            </a>
            <a href="https://www.youtube.com/@AfrikSparkTechSolutions" target="_blank" rel="noopener noreferrer">
              <Youtube className="text-xl text-background/60 hover:text-red-500 hover:scale-110 transition" />
            </a>
            <a href="https://wa.me/23277299080" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="text-xl text-background/60 hover:text-green-500 hover:scale-110 transition" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}