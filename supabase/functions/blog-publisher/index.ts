import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!brevoApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: blog } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('published_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!blog) {
      return new Response(
        JSON.stringify({ message: 'No published blog found' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const dayMap: Record<string, number> = {
      'Build': 1,
      'Attract': 2,
      'Convert': 3,
      'Deliver': 4,
      'Support': 5,
      'Profit': 6,
      'Rest': 7
    };

    const dayNumber = dayMap[blog.category] || 1;
    const subject = `Day ${dayNumber}: ${blog.category} Puzzle – ${blog.title}`;

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0f766e 0%, #1e3a8a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Puzzle2Profit</h1>
        <p style="color: #a8dadc; margin: 10px 0 0 0; font-size: 16px;">Daily AI Puzzles for Solopreneurs</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background: #14b8a6; color: white; display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 20px;">
            ${blog.category}
          </div>
          
          <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px;">${blog.title}</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.8;">${blog.excerpt}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${supabaseUrl.replace('//', '//www.')}/blog/${blog.id}" 
               style="background: #f97316; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Read Full Post →
            </a>
          </div>
          
          ${blog.affiliate_links && blog.affiliate_links.length > 0 ? `
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
            <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">🎯 Recommended Tools</h3>
            ${blog.affiliate_links.map((link: any) => `
              <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                <a href="${link.url}" style="color: #14b8a6; text-decoration: none; font-weight: 600;">
                  ${link.description} →
                </a>
              </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
          <p>You're receiving this because you signed up for daily AI automation insights at Puzzle2Profit</p>
          <p style="margin-top: 10px;">
            <a href="{{unsubscribe}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const { data: contacts } = await supabase
      .from('email_signups')
      .select('email')
      .eq('brevo_synced', true);

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No email contacts found' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: 'Puzzle2Profit',
          email: 'noreply@puzzle2profit.com'
        },
        to: contacts.map(c => ({ email: c.email })),
        subject: subject,
        htmlContent: emailHtml
      }),
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json();
      throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
    }

    const brevoData = await brevoResponse.json();

    await supabase.from('email_campaigns').insert({
      blog_id: blog.id,
      brevo_campaign_id: brevoData.messageId,
      subject: subject,
      sent_count: contacts.length,
      sent_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        blog_id: blog.id,
        sent_to: contacts.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});