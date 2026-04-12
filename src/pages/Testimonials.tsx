import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Quote, Search, Star, Video, Plus, Play } from "lucide-react";
import { motion } from "framer-motion";
import { getTestimonialSource, normalizeTestimonialRow, NormalizedTestimonial, buildTestimonialSelect, clearTestimonialSourceCache } from "@/lib/testimonials";
import { Skeleton } from "@/components/ui/skeleton";

type Testimonial = NormalizedTestimonial;

const PAGE_SIZE = 12;

const categories = [
  { label: "All", value: "all" },
  { label: "Student", value: "Student" },
  { label: "Client", value: "Client" },
  { label: "Partner", value: "Partner" },
];

const extractYoutubeId = (url: string | null) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return match ? match[1] : null;
};

const getVideoEmbedUrl = (url: string | null) => {
  if (!url) return null;

  // YouTube
  const youtubeId = extractYoutubeId(url);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }

  // Vimeo
  if (url.includes("vimeo.com")) {
    const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  }

  return url;
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCohort, setSelectedCohort] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  const uniqueCohorts = useMemo(
    () => Array.from(new Set(testimonials.map((t) => t.cohort).filter(Boolean))),
    [testimonials],
  );

  useEffect(() => {
    loadTestimonials(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedCohort, searchQuery]);

  const buildQuery = async () => {
    const source = await getTestimonialSource();
    const select = buildTestimonialSelect(source);

    let query = supabase
      .from(source)
      .select(select)
      .order("created_at", { ascending: false });

    query =
      source === "testimonials"
        ? query.eq("status", "active")
        : query.or("status.eq.active,approved.eq.true");

    if (selectedCategory !== "all") {
      query = query.eq("role", selectedCategory);
    }

    if (selectedCohort !== "all") {
      query = query.eq("cohort", selectedCohort);
    }

    if (searchQuery.trim()) {
      const escaped = searchQuery.replace(/'/g, "''");
      const testimonialField = source === "testimonials" ? "testimonial_text" : "testimony";
      query = query.or(
        `name.ilike.%${escaped}%,${testimonialField}.ilike.%${escaped}%,organization.ilike.%${escaped}%`,
      );
    }

    console.log(`Building query from ${source} for active testimonials with filters:`, {
      category: selectedCategory,
      cohort: selectedCohort,
      search: searchQuery,
    });

    return { query, source };
  };

  const loadTestimonials = async (reset = false) => {
    if (reset) {
      setPage(0);
      setHasMore(true);
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const nextPage = reset ? 0 : page;
      const from = nextPage * PAGE_SIZE;

      const { query, source } = await buildQuery();
      console.log(`Fetching page ${nextPage} (rows ${from}-${from + PAGE_SIZE - 1}) from ${source}`);
      
      const { data, error } = await query.range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error("Failed to load testimonials - Error:", {
          status: error.status,
          message: error.message,
          source,
          page: nextPage,
        });
        // If it's a 404 and we're still trying testimonials, clear cache and retry
        if (error.status === 404 && source === "testimonials") {
          clearTestimonialSourceCache(); // Clear cache to force re-detection
          const retrySource = await getTestimonialSource();
          if (retrySource !== source) {
            // Retry with the correct source
            const retryQuery = supabase.from(retrySource).select(buildTestimonialSelect(retrySource)).order("created_at", { ascending: false });
            const activeRetryQuery = retrySource === "testimonials"
              ? retryQuery.eq("status", "active")
              : retryQuery.or("status.eq.active,approved.eq.true");

            const { data: retryData, error: retryError } = await activeRetryQuery.range(from, from + PAGE_SIZE - 1);
            console.log(`Retry successful with ${retrySource}:`, retryData?.length ?? 0, "results", retryError);
            if (!retryError && retryData) {
              setTestimonials((prev) => (reset
                ? retryData.map((row: Record<string, unknown>) => normalizeTestimonialRow(row, retrySource))
                : [...prev, ...retryData.map((row: Record<string, unknown>) => normalizeTestimonialRow(row, retrySource))
              ]));
              setHasMore(retryData.length === PAGE_SIZE);
            }
          }
        }
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const fetched = (data ?? []).map((row: Record<string, unknown>) => normalizeTestimonialRow(row, source));
      console.log(`Loaded ${fetched.length} testimonials from page ${nextPage}`);

      setTestimonials((prev) => (reset ? fetched : [...prev, ...fetched]));
      setHasMore(fetched.length === PAGE_SIZE);
      setLoading(false);
      setLoadingMore(false);
      if (reset) setPage(1);
      else setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Unexpected error loading testimonials:", err);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const featuredTestimonials = testimonials.filter((t) => t.is_featured);
  const regularTestimonials = testimonials.filter((t) => !t.is_featured);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Success Stories & Testimonials</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                Hear from our students, alumni, partners, and community members about their transformative experiences.
              </p>
              <Link to="/submit-testimonial">
                <Button size="lg" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Share Your Story
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 px-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, keyword, or organization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Cohort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cohorts</SelectItem>
                  {uniqueCohorts.map((cohort) => (
                    <SelectItem key={cohort} value={cohort!}>
                      {cohort}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Featured Testimonials */}
        {featuredTestimonials.length > 0 && (
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                Featured Stories
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTestimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    featured
                    onClick={() => setSelectedTestimonial(testimonial)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Regular Testimonials */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-lg p-6 border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Testimonials from our students, partners, and clients will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularTestimonials.map((testimonial) => (
                    <TestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                      onClick={() => setSelectedTestimonial(testimonial)}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-10">
                    <Button onClick={() => loadTestimonials(false)} disabled={loadingMore}>
                      {loadingMore ? "Loading…" : "Load more testimonials"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Detailed View Dialog */}
        <Dialog open={!!selectedTestimonial} onOpenChange={() => setSelectedTestimonial(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedTestimonial && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedTestimonial.photo_url || ""} alt={selectedTestimonial.name} />
                      <AvatarFallback>{selectedTestimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{selectedTestimonial.name}</span>
                        {selectedTestimonial.is_featured && (
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      {selectedTestimonial.role && (
                        <Badge variant="secondary" className="mt-1">
                          {selectedTestimonial.role}
                        </Badge>
                      )}
                    </div>
                  </DialogTitle>
                  <DialogDescription>
                    Read the full testimonial from {selectedTestimonial.name}.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {selectedTestimonial.organization && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Organization</p>
                      <p>{selectedTestimonial.organization}</p>
                    </div>
                  )}

                  {selectedTestimonial.cohort && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cohort</p>
                      <p>{selectedTestimonial.cohort}</p>
                    </div>
                  )}

                  {selectedTestimonial.video_url && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <iframe
                        src={getVideoEmbedUrl(selectedTestimonial.video_url) || ""}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div>
                    <Quote className="w-8 h-8 text-muted-foreground/20 mb-2" />
                    <p className="text-lg italic whitespace-pre-wrap">
                      {selectedTestimonial.testimonial_text}
                    </p>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

const TestimonialCard = ({
  testimonial,
  featured = false,
  onClick,
}: {
  testimonial: Testimonial;
  featured?: boolean;
  onClick?: () => void;
}) => {
  const videoId = extractYoutubeId(testimonial.video_url);
  const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`p-6 h-full cursor-pointer hover:shadow-lg transition-all ${
          featured ? "border-primary border-2" : ""
        }`}
        onClick={onClick}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={testimonial.photo_url || ""} alt={testimonial.name} />
              <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                  {testimonial.role && (
                    <Badge variant="secondary" className="mt-1">
                      {testimonial.role}
                    </Badge>
                  )}
                </div>
                {featured && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
              </div>
              {testimonial.organization && (
                <p className="text-sm text-muted-foreground mt-1">{testimonial.organization}</p>
              )}
              {testimonial.cohort && (
                <p className="text-sm text-muted-foreground">{testimonial.cohort}</p>
              )}
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
                <Button variant="ghost" className="rounded-full bg-white/80 hover:bg-white">
                  <Play className="w-5 h-5 text-primary" />
                </Button>
              </div>
            </div>
          )}

          <div className="relative flex-1">
            <Quote className="w-8 h-8 text-muted-foreground/20 absolute -top-2 -left-2" />
            <p className="text-muted-foreground italic line-clamp-4 pl-6">
              {testimonial.testimonial_text}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default Testimonials;
