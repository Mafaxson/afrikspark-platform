import { supabase } from "@/integrations/supabase/client";

export type TestimonialSource = "testimonials" | "testimonies";

export type NormalizedTestimonial = {
  id: string;
  name: string;
  role: string;
  organization: string | null;
  photo_url: string | null;
  testimonial_text: string;
  video_url: string | null;
  is_featured: boolean;
  status: "active" | "hidden";
  cohort?: string | null;
  created_at?: string | null;
};

let cachedSource: TestimonialSource | null = null;

export async function getTestimonialSource(): Promise<TestimonialSource> {
  if (cachedSource) return cachedSource;

  try {
    // If the new `testimonials` table does not exist, the REST API returns 404.
    // Fallback to legacy `testimonies` table so the app continues to work without a migration.
    const { error } = await supabase.from("testimonials").select("id").limit(1).single();
    if (error?.status === 404) {
      cachedSource = "testimonies";
    } else {
      cachedSource = "testimonials";
    }
  } catch (err) {
    // If there's any error (network, auth, etc.), default to testimonies
    cachedSource = "testimonies";
  }

  return cachedSource;
}

export function clearTestimonialSourceCache() {
  cachedSource = null;
}

export function normalizeTestimonialRow(
  row: Record<string, unknown>,
  source: TestimonialSource,
): NormalizedTestimonial {
  if (source === "testimonials") {
    return {
      id: row.id,
      name: row.name,
      role: row.role,
      organization: row.organization ?? null,
      photo_url: row.photo_url ?? null,
      testimonial_text: row.testimonial_text ?? "",
      video_url: row.video_url ?? null,
      is_featured: row.is_featured ?? false,
      status: (row.status as "active" | "hidden") ?? "hidden",
      cohort: (row.cohort as string | null) ?? null,
      created_at: row.created_at ?? null,
    };
  }

  // Legacy table mapping
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? "Student",
    organization: row.organization ?? null,
    photo_url: row.image_url ?? null,
    testimonial_text: row.testimony ?? "",
    video_url: row.video_url ?? null,
    is_featured: row.featured ?? false,
    status:
      (row.status as "active" | "hidden") ?? (row.approved ? "active" : "hidden"),
    cohort: row.cohort ?? null,
    created_at: row.created_at ?? null,
  };
}

export const buildTestimonialSelect = (source: TestimonialSource) => {
  if (source === "testimonials") {
    return "id, name, role, organization, testimonial_text, photo_url, video_url, is_featured, status, cohort, created_at";
  }

  return "id, name, role, organization, testimony, image_url, video_url, featured, status, approved, cohort, created_at";
};
