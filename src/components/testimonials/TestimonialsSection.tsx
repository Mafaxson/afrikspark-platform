import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quote, ChevronLeft, ChevronRight, ArrowRight, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getTestimonialSource, normalizeTestimonialRow, NormalizedTestimonial, buildTestimonialSelect, clearTestimonialSourceCache } from "@/lib/testimonials";

type Testimonial = NormalizedTestimonial;

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Testimonial | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const source = await getTestimonialSource();
    const select = buildTestimonialSelect(source);

    const query = supabase.from(source).select(select).order("created_at", { ascending: false });

    const activeQuery =
      source === "testimonials"
        ? query.eq("status", "active")
        : query.or("status.eq.active,approved.eq.true");

    const { data, error } = await activeQuery
      .eq(source === "testimonials" ? "is_featured" : "featured", true)
      .limit(6);

    if (error) {
      console.error("Failed to load featured testimonials:", error);
      // If it's a 404 and we're still trying testimonials, clear cache and retry
      if (error.status === 404 && source === "testimonials") {
        clearTestimonialSourceCache();
        const retrySource = await getTestimonialSource();
        if (retrySource !== source) {
          const retrySelect = buildTestimonialSelect(retrySource);
          const retryQuery = supabase.from(retrySource).select(retrySelect).order("created_at", { ascending: false });
          const retryActiveQuery = retrySource === "testimonials"
            ? retryQuery.eq("status", "active")
            : retryQuery.or("status.eq.active,approved.eq.true");

          const { data: retryData, error: retryError } = await retryActiveQuery
            .eq(retrySource === "testimonials" ? "is_featured" : "featured", true)
            .limit(6);

          if (!retryError && retryData) {
            setTestimonials(retryData.map((row: Record<string, unknown>) => normalizeTestimonialRow(row, retrySource)));
          }
        }
      }
      setLoading(false);
      return;
    }

    if (data) {
      setTestimonials(data.map((row: Record<string, unknown>) => normalizeTestimonialRow(row, source)));
    }
    setLoading(false);
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const getYoutubeId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const getYoutubeThumbnail = (url: string | null) => {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  };

  if (loading || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stories of Impact & Success</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hear from our community about their transformative experiences.
          </p>
        </motion.div>

        {/* Mobile Carousel */}
        <div className="lg:hidden relative">
          <div className="relative min-h-[440px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <TestimonialCard
                  testimonial={testimonials[currentIndex]}
                  onView={() => setSelected(testimonials[currentIndex])}
                  getThumbnail={getYoutubeThumbnail}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={prevTestimonial} className="rounded-full">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/30"
                  }`}
                  aria-label={`Select testimonial ${index + 1}`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={nextTestimonial} className="rounded-full">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hidden lg:grid lg:grid-cols-3 gap-6"
        >
          {testimonials.slice(0, 3).map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              onView={() => setSelected(testimonial)}
              getThumbnail={getYoutubeThumbnail}
            />
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/testimonials">
            <Button size="lg" variant="outline" className="group">
              View All Success Stories
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selected.photo_url || ""} alt={selected.name} />
                    <AvatarFallback>{selected.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{selected.name}</span>
                      {selected.is_featured && (
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selected.role}
                      {selected.organization ? ` • ${selected.organization}` : ""}
                    </p>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  See the full testimonial and watch the video testimonial (if available).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selected.video_url && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                      src={
                        getYoutubeId(selected.video_url)
                          ? `https://www.youtube.com/embed/${getYoutubeId(selected.video_url)}`
                          : ""
                      }
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <div>
                  <Quote className="w-8 h-8 text-muted-foreground/20 mb-2" />
                  <p className="text-lg italic whitespace-pre-wrap">{selected.testimonial_text}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

const TestimonialCard = ({
  testimonial,
  onView,
  getThumbnail,
}: {
  testimonial: Testimonial;
  onView: () => void;
  getThumbnail: (url: string | null) => string | null;
}) => {
  const thumbnail = getThumbnail(testimonial.video_url);

  return (
    <Card className="p-6 h-full hover:shadow-lg transition-shadow">
      <div className="flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-14 h-14 flex-shrink-0">
            <AvatarImage src={testimonial.photo_url || ""} alt={testimonial.name} />
            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{testimonial.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {testimonial.role}
              </Badge>
              {testimonial.organization && (
                <span className="text-sm text-muted-foreground truncate">{testimonial.organization}</span>
              )}
            </div>
          </div>
        </div>

        {thumbnail && (
          <div className="relative mb-4 rounded-lg overflow-hidden">
            <img
              src={thumbnail}
              alt="Video thumbnail"
              className="w-full h-40 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Button
                variant="ghost"
                className="rounded-full bg-white/80 hover:bg-white"
                onClick={onView}
              >
                <Play className="w-5 h-5 text-primary" />
              </Button>
            </div>
          </div>
        )}

        <div className="relative flex-1">
          <Quote className="w-8 h-8 text-muted-foreground/20 absolute -top-2 -left-2" />
          <p className="text-muted-foreground italic line-clamp-5 pl-6">{testimonial.testimonial_text}</p>
        </div>

        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full" onClick={onView}>
            Read More
          </Button>
        </div>
      </div>
    </Card>
  );
};
