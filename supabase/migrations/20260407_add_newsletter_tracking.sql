-- Add newsletter tracking to blog posts
-- Ensures emails are only sent once when a post is first published

-- Add newsletter_sent_at column to track when newsletter was sent
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS newsletter_sent_at timestamp with time zone;

-- Create improved function to send newsletter
CREATE OR REPLACE FUNCTION send_blog_newsletter()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  supabase_key TEXT;
BEGIN
  -- Only send newsletter when post becomes published AND newsletter hasn't been sent yet
  IF NEW.is_published = true 
     AND (OLD IS NULL OR OLD.is_published = false) 
     AND NEW.newsletter_sent_at IS NULL THEN
    
    -- Mark that we've sent the newsletter (prevents duplicate sends)
    NEW.newsletter_sent_at = now();
    
    -- Log the trigger event
    RAISE LOG 'Triggering newsletter send for blog post: %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS send_blog_newsletter_trigger ON public.blog_posts;
CREATE TRIGGER send_blog_newsletter_trigger
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION send_blog_newsletter();

-- Create a separate function to handle the actual HTTP call to the edge function
-- This will be called by a webhook/scheduled job when newsletter_sent_at is updated
CREATE OR REPLACE FUNCTION trigger_newsletter_send()
RETURNS TRIGGER AS $$
BEGIN
  -- When newsletter_sent_at is set to a value, call the edge function
  IF NEW.newsletter_sent_at IS NOT NULL AND (OLD.newsletter_sent_at IS NULL) THEN
    -- Queue the newsletter send via HTTP call
    INSERT INTO public.newsletter_queue (blog_post_id, status, created_at)
    VALUES (NEW.id, 'pending', now());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create newsletter queue table for reliable delivery tracking
CREATE TABLE IF NOT EXISTS public.newsletter_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  last_error text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone
);

-- Enable RLS on newsletter_queue
ALTER TABLE public.newsletter_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletter_queue
CREATE POLICY "Admins can view newsletter queue" ON public.newsletter_queue FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create index on blog_post_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_queue_blog_post_id ON public.newsletter_queue(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_queue_status ON public.newsletter_queue(status);

-- Create trigger for newsletter_queue
DROP TRIGGER IF EXISTS trigger_newsletter_send_on_posts ON public.blog_posts;
CREATE TRIGGER trigger_newsletter_send_on_posts
  AFTER UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_newsletter_send();
