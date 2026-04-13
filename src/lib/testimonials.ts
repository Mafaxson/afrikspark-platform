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
  status: "pending" | "approved" | "rejected";
  created_at?: string | null;
  updated_at?: string | null;
};

let cachedSource: TestimonialSource | null = null;

export async function getTestimonialSource(): Promise<TestimonialSource> {
  if (cachedSource) return cachedSource;

  try {
    // Try the new testimonials table first
    const { error } = await supabase.from("testimonials").select("id").limit(1).single();
    if (error?.status === 404) {
      cachedSource = "testimonies";
    } else {
      cachedSource = "testimonials";
    }
  } catch (err) {
    cachedSource = "testimonials"; // Default to new table
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
      id: row.id as string,
      name: row.name as string,
      role: row.role as string,
      organization: (row.organization as string | null) ?? null,
      photo_url: (row.photo_url as string | null) ?? null,
      testimonial_text: (row.testimonial_text as string) ?? "",
      video_url: (row.video_url as string | null) ?? null,
      is_featured: (row.is_featured as boolean) ?? false,
      status: (row.status as "pending" | "approved" | "rejected") ?? "pending",
      created_at: (row.created_at as string | null) ?? null,
      updated_at: (row.updated_at as string | null) ?? null,
    };
  }

  // Legacy table mapping (testimonies -> testimonials)
  return {
    id: row.id as string,
    name: row.name as string,
    role: "Student", // Legacy table doesn't have role
    organization: (row.contact as string | null) ?? null,
    photo_url: (row.image_url as string | null) ?? null,
    testimonial_text: (row.testimony as string) ?? "",
    video_url: (row.video_url as string | null) ?? null,
    is_featured: false,
    status: (row.approved as boolean) ? "approved" : "pending",
    created_at: (row.created_at as string | null) ?? null,
  };
}

export const buildTestimonialSelect = (source: TestimonialSource) => {
  if (source === "testimonials") {
    return "id, name, role, organization, testimonial_text, photo_url, video_url, is_featured, status, created_at, updated_at";
  }

  // Legacy table columns
  return "id, name, contact, image_url, video_url, testimony, approved, created_at";
};
