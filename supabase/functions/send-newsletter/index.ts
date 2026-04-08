import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendNewsletterRequest {
  title: string;
  slug: string;
  excerpt: string;
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
    const { title, slug, excerpt } = payload;

    if (!title || !slug || !excerpt) {
      throw new Error("title, slug, and excerpt are required");
    }

    // Fetch all emails from newsletter_subscribers
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from("newsletter_subscribers")
      .select("email");

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers found");
      return new Response(
        JSON.stringify({
          message: "No subscribers found",
          successCount: 0,
          errorCount: 0,
          totalSubscribers: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable not set");
    }

    // Prepare email content
    const subject = title;
    const postUrl = `https://afrikspark.tech/blog/${slug}`;

    const htmlContent = `
<h2>${title}</h2>
<p>${excerpt}</p>
<br/>
<a href="${postUrl}" style="
  padding:10px 20px;
  background:black;
  color:white;
  text-decoration:none;
  border-radius:5px;
">
  Read Full Article
</a>
`;

    // Extract emails into array
    const emailList = subscribers.map(sub => sub.email);

    // Send email using Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "AfrikSpark <info@afrikspark.tech>",
        to: emailList,
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      throw new Error(`Resend API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({
        message: "Newsletter sent successfully",
        successCount: emailList.length,
        errorCount: 0,
        totalSubscribers: emailList.length,
        title,
        slug
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        message: "Failed to send newsletter"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
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