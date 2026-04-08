-- Enable HTTP extension for making HTTP requests
create extension if not exists http with schema extensions;

-- Create function to call newsletter edge function
create or replace function public.trigger_newsletter_on_blog_publish()
returns trigger as $$
declare
  response_status int;
  response_body text;
begin
  -- Only trigger if the post is being published
  if new.is_published = true then
    -- Call the send-newsletter edge function
    select
      status,
      content into response_status, response_body
    from http_post(
      'https://flrnlsceusewzphbyugq.supabase.co/functions/v1/send-newsletter',
      jsonb_build_object(
        'title', new.title,
        'slug', new.slug,
        'excerpt', new.excerpt
      )::text,
      'application/json'
    );

    -- Log the response for debugging
    raise notice 'Newsletter function called. Status: %, Response: %', response_status, response_body;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Create trigger on blog_posts table
drop trigger if exists blog_newsletter_trigger on public.blog_posts;

create trigger blog_newsletter_trigger
after insert on public.blog_posts
for each row
execute function public.trigger_newsletter_on_blog_publish();

-- Grant necessary permissions
grant execute on function public.trigger_newsletter_on_blog_publish() to authenticated, anon;
