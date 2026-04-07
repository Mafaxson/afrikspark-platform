import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the blog post that was just published
    const { post_id } = await req.json();

    if (!post_id) {
      throw new Error("Post ID is required");
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

    // Get all active newsletter subscribers
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    if (subscribersError) {
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscribers found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare newsletter content
    const subject = `AfrikSpark: New Blog Post - ${post.title}`;
    const excerpt = post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
    const postUrl = `https://afrikspark.tech/blog/${post.slug}`;

    const emailBody = `Hi there!

We just published a new blog post that you might find interesting:

📝 ${post.title}

${excerpt}

Read the full post: ${postUrl}

Best regards,
AfrikSpark Team

---
To unsubscribe, please visit: https://afrikspark.tech/unsubscribe
`;

    // Send emails to all subscribers (in batches to avoid rate limits)
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      try {
        const emailPromises = batch.map(subscriber => {
          return fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            },
            body: JSON.stringify({
              from: "AfrikSpark <newsletter@afrikspark.tech>",
              to: [subscriber.email],
              subject: subject,
              text: emailBody,
            }),
          });
        });

        const results = await Promise.allSettled(emailPromises);

        results.forEach(result => {
          if (result.status === 'fulfilled') {
            successCount++;
          } else {
            errorCount++;
            console.error("Failed to send email:", result.reason);
          }
        });

        // Small delay between batches to avoid rate limits
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error("Error sending batch:", error);
        errorCount += batch.length;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Newsletter sent to ${successCount} subscribers. ${errorCount} failed.`,
        successCount,
        errorCount,
        totalSubscribers: subscribers.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});