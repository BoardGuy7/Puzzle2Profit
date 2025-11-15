import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CopywriterRequest {
  category: string;
  topic: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { category, topic }: CopywriterRequest = await req.json();

    if (!category || !topic) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const grokApiKey = Deno.env.get('XAI_API_KEY');
    if (!grokApiKey) {
      throw new Error('XAI_API_KEY not configured');
    }

    const prompt = `Write an engaging, actionable blog post for solopreneurs about ${topic} in the "${category}" phase of business development.

The post should:
- Be 800-1200 words
- Include practical, hands-on advice
- Mention 2-3 specific AI tools relevant to this topic
- Use a friendly, direct tone
- Include actionable takeaways
- Format in HTML with proper headings, paragraphs, and lists

Also provide:
1. A compelling 150-character excerpt
2. 2-3 affiliate link suggestions with descriptions`;

    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grokApiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer for solopreneurs, specializing in AI automation and business growth strategies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'grok-2-latest',
        temperature: 0.7,
      }),
    });

    if (!grokResponse.ok) {
      const errorData = await grokResponse.text();
      throw new Error(`Grok API error: ${errorData}`);
    }

    const grokData = await grokResponse.json();
    const generatedText = grokData.choices[0]?.message?.content || '';

    const excerptMatch = generatedText.match(/Excerpt:[\s\S]*?([^\n]+)/);
    const excerpt = excerptMatch ? excerptMatch[1].trim() : generatedText.substring(0, 150);

    const contentMatch = generatedText.match(/<[^>]+>|\n/);
    const content = contentMatch ? generatedText : `<div>${generatedText}</div>`;

    const affiliateMatches = generatedText.match(/Affiliate[\s\S]*?:\s*([\s\S]*?)(?=\n\n|$)/i);
    const affiliateSuggestions = affiliateMatches ? [
      {
        url: '',
        description: 'Tool recommendation from AI (replace with actual affiliate link)'
      }
    ] : [];

    return new Response(
      JSON.stringify({
        content,
        excerpt,
        affiliate_suggestions: affiliateSuggestions
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