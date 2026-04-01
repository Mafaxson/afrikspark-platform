import { supabase } from "@/integrations/supabase/client";

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  bucket_name: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  uploaded_by: string | null;
  related_to_table: string;
  related_to_id: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

// Bucket mapping for different content types
const BUCKET_MAPPING = {
  testimonials: 'testimonial-media',
  projects: 'project-media',
  blog: 'blog-media',
  services: 'service-media',
  partnerships: 'partnership-logos',
  venture: 'venture-media',
  community: 'community-media',
  contact: 'contact-attachments',
  avatars: 'avatars',
  documents: 'documents',
  videos: 'videos',
  audio: 'audio-files',
  general: 'user-uploads'
};

export class FileUploadService {
  /**
   * Upload a single file to Supabase Storage
   */
  static async uploadFile(
    file: File,
    contentType: keyof typeof BUCKET_MAPPING,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const bucket = options.bucket || BUCKET_MAPPING[contentType] || 'user-uploads';
    const folder = options.folder || contentType;
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    const allowedTypes = options.allowedTypes || this.getAllowedTypes(contentType);

    // Validate file
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    try {
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Register file in media_files table
      const { error: mediaError } = await supabase
        .from('media_files')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrl,
          bucket_name: bucket,
          file_type: this.getFileType(file.type),
          mime_type: file.type,
          file_size: file.size,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          related_to_table: contentType,
          is_public: this.isPublicBucket(bucket)
        });

      if (mediaError) {
        console.warn('Failed to register file in media_files table:', mediaError);
      }

      return {
        url: publicUrl,
        path: filePath,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(
    files: File[],
    contentType: keyof typeof BUCKET_MAPPING,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, contentType, options);
        results.push(result);

        if (options.onProgress) {
          options.onProgress((results.length / files.length) * 100);
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files
      }
    }

    return results;
  }

  /**
   * Delete a file from storage by bucket and path
   */
  static async deleteFileByPath(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    // Remove from media_files table
    await supabase
      .from('media_files')
      .delete()
      .eq('file_path', path)
      .eq('bucket_name', bucket);
  }

  /**
   * Delete a file from storage by URL
   */
  static async deleteFile(url: string): Promise<void> {
    // Extract bucket and path from Supabase public URL
    // URL format: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlParts = url.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) {
      throw new Error('Invalid Supabase storage URL');
    }

    const pathParts = urlParts[1].split('/');
    const bucket = pathParts[0];
    const path = pathParts.slice(1).join('/');

    await this.deleteFileByPath(bucket, path);
  }

  /**
   * Get files for a specific content type and related ID
   */
  static async getFiles(
    contentType: string,
    relatedId?: string
  ): Promise<MediaFile[]> {
    let query = supabase
      .from('media_files')
      .select('*')
      .eq('related_to_table', contentType)
      .order('created_at', { ascending: false });

    if (relatedId) {
      query = query.eq('related_to_id', relatedId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch files: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get allowed file types for a content type
   */
  private static getAllowedTypes(contentType: keyof typeof BUCKET_MAPPING): string[] {
    const typeMappings: Record<keyof typeof BUCKET_MAPPING, string[]> = {
      testimonials: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
      projects: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'],
      blog: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
      services: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      partnerships: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
      venture: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'],
      community: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg'],
      contact: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      avatars: ['image/jpeg', 'image/png', 'image/webp'],
      documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      videos: ['video/mp4', 'video/webm', 'video/ogg'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
      general: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4', 'audio/mpeg']
    };

    return typeMappings[contentType] || typeMappings.general;
  }

  /**
   * Get file type category
   */
  private static getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  }

  /**
   * Check if bucket is public
   */
  private static isPublicBucket(bucket: string): boolean {
    const publicBuckets = ['avatars', 'community-media', 'blog-media', 'project-media', 'testimonial-media', 'service-media', 'partnership-logos', 'venture-media', 'videos', 'audio-files'];
    return publicBuckets.includes(bucket);
  }
}

// Convenience functions for specific use cases
export const uploadTestimonialMedia = (files: File[], options?: UploadOptions) =>
  FileUploadService.uploadFiles(files, 'testimonials', options);

export const uploadProjectMedia = (files: File[], options?: UploadOptions) =>
  FileUploadService.uploadFiles(files, 'projects', options);

export const uploadBlogMedia = (files: File[], options?: UploadOptions) =>
  FileUploadService.uploadFiles(files, 'blog', options);

export const uploadServiceMedia = (files: File[], options?: UploadOptions) =>
  FileUploadService.uploadFiles(files, 'services', options);

export const uploadAvatar = (file: File, options?: UploadOptions) =>
  FileUploadService.uploadFile(file, 'avatars', options);

export const uploadContactAttachment = (files: File[], options?: UploadOptions) =>
  FileUploadService.uploadFiles(files, 'contact', options);