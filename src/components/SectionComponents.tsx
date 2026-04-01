import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  alt?: boolean;
}

export function Section({ children, className, id, alt }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("py-20 md:py-28", alt && "bg-section-alt", className)}
    >
      <div className="container mx-auto px-4">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ badge, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl mx-auto text-center mb-16", className)}>
      {badge && (
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4 bg-primary/10 px-3 py-1 rounded-full">
          {badge}
        </span>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
      )}
    </div>
  );
}

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimateOnScroll({ children, className, delay = 0 }: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCounterProps {
  value: string;
  label: string;
}

export function StatCounter({ value, label }: StatCounterProps) {
  return (
    <div className="text-center">
      <div className="font-display text-4xl md:text-5xl font-bold text-gradient mb-2">
        {value}
      </div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </div>
  );
}
