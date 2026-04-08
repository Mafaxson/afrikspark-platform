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
    console.log("Newsletter triggered");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: SendNewsletterRequest = await req.json();
    const { title, slug, excerpt } = payload;

    // Fetch all emails from newsletter_subscribers
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from("newsletter_subscribers")
      .select("email");

    if (subscribersError) {
      throw subscribersError;
    }

    console.log("Subscribers:", subscribers);

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          emails_sent: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract email list
    const emails = subscribers.map(sub => sub.email);
    console.log("Sending to:", emails);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable not set");
    }

    // Send email using Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AfrikSpark <info@afrikspark.tech>",
        to: emails,
        subject: title,
        html: `
          <h2>${title}</h2>
          <p>${excerpt}</p>
          <br/>
          <a href="https://afrikspark.tech/blog/${slug}">
            Read Full Article
          </a>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({
        success: true,
        emails_sent: emails.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});