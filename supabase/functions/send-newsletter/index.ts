import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendNewsletterRequest {
  post_id?: string;
  queue_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: SendNewsletterRequest = await req.json();
    const post_id = payload.post_id;
    const queue_id = payload.queue_id;

    if (!post_id && !queue_id) {
      throw new Error("Either post_id or queue_id is required");
    }

    // Fetch the blog post details
    const { data: post, error: postError } = await supabaseClient
      .from("blog_posts")
      .select("*")
      .eq("id", post_id)
      .single();

    if (postError || !post) {
      throw new Error("Blog post not found");
    }

    // Only send if newsletter hasn't been sent yet (duplicate prevention)
    if (post.newsletter_sent_at) {
      return new Response(
        JSON.stringify({
          message: "Newsletter already sent for this post",
          post_id: post.id,
          sent_at: post.newsletter_sent_at,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all active newsletter subscribers
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    if (subscribersError) {
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      // Update newsletter_sent_at even with no subscribers
      await supabaseClient
        .from("blog_posts")
        .update({ newsletter_sent_at: new Date().toISOString() })
        .eq("id", post.id);

      return new Response(
        JSON.stringify({ message: "No active subscribers found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable not set");
    }

    // Prepare newsletter content
    const subject = `New Blog Post: ${post.title}`;
    const excerpt =
      post.excerpt ||
      post.content.replace(/<[^>]*>/g, "").substring(0, 200) + "...";
    const postUrl = `https://afrikspark.tech/blog/${post.slug}`;

    // HTML email template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f97316; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .title { font-size: 24px; font-weight: bold; margin: 15px 0; }
    .excerpt { font-size: 16px; color: #666; margin: 15px 0; line-height: 1.6; }
    .cta-button { display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>AfrikSpark Blog</h2>
    </div>
    <div class="content">
      <p>Hi there!</p>
      <p>We just published a new blog post that you might find interesting:</p>
      <div class="title">${post.title}</div>
      <div class="excerpt">${excerpt}</div>
      <a href="${postUrl}" class="cta-button">Read Full Post →</a>
      <div class="footer">
        <p>You're receiving this because you subscribed to the AfrikSpark newsletter.</p>
        <p><a href="https://afrikspark.tech/unsubscribe" style="color: #999;">Unsubscribe</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

    const plainTextContent = `
Hi there!

We just published a new blog post that you might find interesting:

${post.title}

${excerpt}

Read the full post: ${postUrl}

---
Best regards,
AfrikSpark Team

To unsubscribe: https://afrikspark.tech/unsubscribe
`;

    // Send emails to all subscribers (in batches to avoid rate limits)
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      try {
        const emailPromises = batch.map(async (subscriber) => {
          try {
            const response = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: "AfrikSpark <newsletter@afrikspark.tech>",
                to: subscriber.email,
                subject: subject,
                html: htmlContent,
                text: plainTextContent,
                reply_to: "hello@afrikspark.tech",
              }),
            });

            if (!response.ok) {
              const error = await response.text();
              throw new Error(
                `Resend API error: ${response.status} - ${error}`
              );
            }

            return { success: true };
          } catch (error) {
            errors.push(`Failed for ${subscriber.email}: ${error.message}`);
            return { success: false, error: error.message };
          }
        });

        const results = await Promise.allSettled(emailPromises);

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            if (result.value.success) {
              successCount++;
            } else {
              errorCount++;
            }
          } else {
            errorCount++;
            errors.push(result.reason?.message || "Unknown error");
          }
        });

        // Small delay between batches to avoid rate limits
        if (i + batchSize < subscribers.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error("Error sending batch:", error);
        errorCount += batch.length;
        errors.push(`Batch error: ${error.message}`);
      }
    }

    // Mark as sent only if we had success
    if (successCount > 0) {
      const { error: updateError } = await supabaseClient
        .from("blog_posts")
        .update({ newsletter_sent_at: new Date().toISOString() })
        .eq("id", post.id);

      if (updateError) {
        console.error("Error updating post newsletter_sent_at:", updateError);
      }
    }

    // Update queue status if tracking
    if (queue_id && successCount > 0) {
      await supabaseClient
        .from("newsletter_queue")
        .update({
          status: errorCount > 0 ? "failed" : "sent",
          sent_count: successCount,
          failed_count: errorCount,
          last_error: errors.length > 0 ? errors.join("; ") : null,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", queue_id);
    }

    return new Response(
      JSON.stringify({
        message: "Newsletter sent successfully",
        post_id: post.id,
        post_title: post.title,
        successCount,
        errorCount,
        totalSubscribers: subscribers.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});