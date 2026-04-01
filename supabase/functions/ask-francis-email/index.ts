type Payload = {
  toEmail: string;
  toName?: string;
  ticketSubject?: string;
  replyText: string;
  subject?: string;
  appUrl?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const appUrl = Deno.env.get("APP_URL") ?? "https://www.drivingschooltv.com";

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing RESEND_API_KEY secret" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const body = (await req.json()) as Payload;

    const toEmail = body.toEmail?.trim();
    const toName = body.toName?.trim() || "there";
    const ticketSubject =
      body.ticketSubject?.trim() || "your Ask Francis question";
    const replyText = body.replyText?.trim();
    const emailSubject =
      body.subject?.trim() || "Francis has replied to your Ask Francis question";
    const safeAppUrl = body.appUrl?.trim() || appUrl;

    if (!toEmail || !replyText) {
      return new Response(
        JSON.stringify({ error: "Missing toEmail or replyText" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 640px; margin: 0 auto;">
        <h2 style="margin-bottom: 12px;">Francis has replied to your Ask Francis question</h2>
        <p>Hi ${toName},</p>
        <p>There’s a reply waiting for you in Instructor In Your Pocket for:</p>
        <p><strong>${ticketSubject}</strong></p>
        <div style="margin: 20px 0; padding: 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px;">
          ${replyText.replace(/\n/g, "<br />")}
        </div>
        <p>You can log in here to view the full thread:</p>
        <p>
          <a href="${safeAppUrl}" style="display:inline-block;padding:12px 18px;background:#47778f;color:#ffffff;text-decoration:none;border-radius:10px;">
            Open Instructor In Your Pocket
          </a>
        </p>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Driving School TV <onboarding@resend.dev>",
        to: [toEmail],
        subject: emailSubject,
        html,
      }),
    });

    const resendText = await resendResponse.text();

    if (!resendResponse.ok) {
      console.error("RESEND ERROR RAW:", resendText);

      return new Response(
        JSON.stringify({
          error: `Resend returned ${resendResponse.status}: ${resendText}`,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, data: resendText }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("FUNCTION ERROR:", message);

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: corsHeaders }
    );
  }
});