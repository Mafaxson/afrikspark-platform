# Blog Newsletter Email System

Automatic email sending when blog posts are published to all newsletter subscribers using Supabase Edge Functions and Resend API.

## Overview

When a blog post is marked as `is_published = true` for the first time:
1. Database trigger marks `newsletter_sent_at` timestamp
2. Newsletter entry is queued in `newsletter_queue` table
3. Manually trigger the edge function to send emails
4. Resend API delivers HTML emails to all active subscribers
5. Duplicate sends are prevented by checking `newsletter_sent_at`

## Setup

### 1. Set Environment Variables

In your Supabase dashboard (Project Settings → Environment Variables), add:

```
RESEND_API_KEY=your_resend_api_key_here
```

Get your Resend API key from [https://resend.com/api-keys](https://resend.com/api-keys)

### 2. Apply Migrations

The migrations are automatically applied when deployed:
- `20260407_upgrade_blog_system.sql` - Core blog system with `is_published` column
- `20260407_add_newsletter_tracking.sql` - Newsletter tracking and queue tables

### 3. Verify Database Schema

Check that your `blog_posts` table has:
- `newsletter_sent_at` timestamp column (nullable)
- `is_published` boolean column

Check that `newsletter_queue` table exists with columns:
- `id` (uuid)
- `blog_post_id` (uuid)
- `status` (pending|sent|failed)
- `sent_count`, `failed_count` (integers)
- `last_error` (text)
- `created_at`, `updated_at`, `sent_at` (timestamps)

## How It Works

### Publishing a Post

1. In admin dashboard, create a new blog post
2. Click "Publish" to set `is_published = true`
3. Database trigger automatically sets `newsletter_sent_at = NULL` (if first time)
4. Newsletter entry is queued in `newsletter_queue` table with status `pending`

### Sending Emails

**Option A: Manual Trigger (For Testing)**

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-newsletter \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"post_id": "your-post-id-here"}'
```

**Option B: Automatic Trigger (Production)**

Set up a Supabase Cron Job to periodically check and send pending newsletters:

1. Go to Supabase Dashboard → SQL Editor
2. Create a scheduled function that calls the edge function for pending posts:

```sql
CREATE OR REPLACE FUNCTION public.process_pending_newsletters()
RETURNS void AS $$
BEGIN
  -- This would need to be called via HTTP to trigger the edge function
  -- Since Supabase doesn't have direct HTTP from plpgsql in the free tier,
  -- use a scheduled job service like Render, Vercel, or n8n
  NULL;
END;
$$ LANGUAGE plpgsql;
```

**Recommended: Use External Scheduler**

Set up a cron job using:
- **Vercel Crons** (if deployed on Vercel)
- **GitHub Actions** (free tier)
- **Render** (background workers)
- **n8n** (automation platform)

Example GitHub Actions (`/.github/workflows/send-newsletters.yml`):

```yaml
name: Send Newsletter Emails

on:
  schedule:
    - cron: '0 9 * * 1,3,5'  # 9 AM UTC on Mon, Wed, Fri

jobs:
  send-newsletter:
    runs-on: ubuntu-latest
    steps:
      - name: Check for pending newsletters
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/send-newsletter \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{}'
```

## Email Content

The system sends beautifully formatted HTML emails with:
- **Subject:** New Blog Post: [Title]
- **Logo:** AfrikSpark branding
- **Title:** Full blog post title
- **Excerpt:** First 200 characters of post excerpt or content
- **CTA Button:** "Read Full Post →" linking to `/blog/{slug}`
- **Reply-To:** hello@afrikspark.tech
- **Unsubscribe Link:** Footer unsubscribe link

### HTML Template Features
- Responsive design (mobile-friendly)
- Professional AfrikSpark branding with orange accent (#f97316)
- Clean typography
- Unsubscribe link in footer
- Fallback plain text version

## Duplicate Prevention

The system prevents duplicate emails through:

1. **`newsletter_sent_at` Column:** Once set, edge function skips the post
2. **Status Check:** Function returns early if `newsletter_sent_at` is already populated
3. **Queue Status:** `newsletter_queue` tracks sent status per post

Example:
- Post 1 published → `newsletter_sent_at = NULL` → emails sent → `newsletter_sent_at = 2026-04-07 10:30:00`
- Later attempt to resend post 1 → function detects `newsletter_sent_at` is set → skips → returns early

## Monitoring

### Check Newsletter Queue

```sql
SELECT 
  nq.id,
  bp.title,
  nq.status,
  nq.sent_count,
  nq.failed_count,
  nq.created_at,
  nq.sent_at
FROM newsletter_queue nq
JOIN blog_posts bp ON nq.blog_post_id = bp.id
ORDER BY nq.created_at DESC
LIMIT 20;
```

### Check Subscriber Count

```sql
SELECT 
  COUNT(*) as total_subscribers,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_subscribers
FROM newsletter_subscribers;
```

### View Recent Sends

```sql
SELECT 
  id,
  title,
  newsletter_sent_at,
  is_published,
  published_at
FROM blog_posts
WHERE newsletter_sent_at IS NOT NULL
ORDER BY newsletter_sent_at DESC
LIMIT 10;
```

## Error Handling

If emails fail to send:

1. **Resend API Error:** Edge function logs error to `newsletter_queue.last_error`
2. **Network Issues:** Individual subscriber errors don't block batch
3. **Rate Limiting:** Function adds 500ms delay between batches

Check errors:

```sql
SELECT 
  nq.id,
  bp.title,
  nq.last_error,
  nq.failed_count
FROM newsletter_queue nq
JOIN blog_posts bp ON nq.blog_post_id = bp.id
WHERE nq.status = 'failed'
ORDER BY nq.updated_at DESC;
```

## API Reference

### Edge Function: POST /send-newsletter

**URL:**
```
https://your-project.supabase.co/functions/v1/send-newsletter
```

**Headers:**
```
Authorization: Bearer {SUPABASE_SERVICE_KEY}
Content-Type: application/json
```

**Request Body:**
```json
{
  "post_id": "uuid-of-blog-post",
  "queue_id": "uuid-of-queue-entry"  // optional
}
```

**Response Success (200):**
```json
{
  "message": "Newsletter sent successfully",
  "post_id": "...",
  "post_title": "...",
  "successCount": 150,
  "errorCount": 2,
  "totalSubscribers": 152,
  "errors": [
    "Failed for user@example.com: Invalid email format"
  ]
}
```

**Response - Already Sent (200):**
```json
{
  "message": "Newsletter already sent for this post",
  "post_id": "...",
  "sent_at": "2026-04-07T10:30:00Z"
}
```

**Response Error (500):**
```json
{
  "error": "RESEND_API_KEY environment variable not set",
  "details": "..."
}
```

## Database Tables

### blog_posts
```sql
ALTER TABLE blog_posts ADD COLUMN newsletter_sent_at timestamp with time zone;
```

### newsletter_queue
```sql
CREATE TABLE newsletter_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  last_error text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone
);
```

### newsletter_subscribers
```sql
CREATE TABLE newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);
```

## Testing

### Test Newsletter Subscription

```bash
curl -X POST https://your-project.supabase.co/rest/v1/newsletter_subscribers \
  -H "Authorization: Bearer {SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test Email Sending

1. Create a test blog post with content
2. Publish the post (`is_published = true`)
3. Manually call the edge function with the post ID
4. Check Resend dashboard for delivery status
5. Verify emails arrived at subscriber addresses

## Troubleshooting

**Issue:** Emails not sending
- Check `RESEND_API_KEY` is set in Supabase environment variables
- Verify Resend account has available credits
- Check edge function logs in Supabase dashboard

**Issue:** Duplicate emails sending
- Verify `newsletter_sent_at` gets updated after first send
- Check that edge function returns early if `newsletter_sent_at` is set

**Issue:** Some subscribers not receiving
- Check `is_active = true` for subscribers
- Verify email format in database
- Check Resend bounce/spam reports

**Issue:** Function timeout
- Reduce batch size from 50 to 25
- Increase `batchSize` constant in edge function

## Next Steps

1. Set up external cron job to trigger newsletters on schedule
2. Add unsubscribe page at `/unsubscribe`
3. Create subscriber management admin panel
4. Monitor delivery metrics in Resend dashboard
5. A/B test email subject lines and content
