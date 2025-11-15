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
    let generatedText = grokData.choices[0]?.message?.content || '';

    // Remove markdown code blocks if present
    if (generatedText.includes('```html')) {
      const htmlMatch = generatedText.match(/```html\s*([\s\S]*?)```/);
      if (htmlMatch && htmlMatch[1]) {
        generatedText = htmlMatch[1].trim();
      }
    }

    // Extract excerpt (look for patterns like "excerpt:" or quoted text after the HTML)
    let excerpt = '';
    const excerptPatterns = [
      /excerpt[:\s]+["']([^"'\n]{50,200})["']/i,
      /150-character excerpt[:\s]+["']([^"'\n]{50,200})["']/i,
      /compelling excerpt[:\s]+["']([^"'\n]{50,200})["']/i
    ];

    for (const pattern of excerptPatterns) {
      const match = generatedText.match(pattern);
      if (match && match[1]) {
        excerpt = match[1].trim();
        break;
      }
    }

    // If no excerpt found, extract first paragraph from HTML
    if (!excerpt) {
      const firstPMatch = generatedText.match(/<p[^>]*>([\s\S]*?)<\/p>/);
      if (firstPMatch && firstPMatch[1]) {
        const textContent = firstPMatch[1].replace(/<[^>]+>/g, '').trim();
        excerpt = textContent.substring(0, 150);
      }
    }

    // Extract HTML content (remove everything after closing </html> or </body> or </article>)
    let content = generatedText;

    // If it's a full HTML document, extract just the body content
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    if (bodyMatch && bodyMatch[1]) {
      content = bodyMatch[1].trim();
    } else if (content.includes('<article>')) {
      // If it's just an article, keep it as is
      const articleMatch = content.match(/<article[^>]*>[\s\S]*?<\/article>/);
      if (articleMatch) {
        content = articleMatch[0];
      }
    }

    // Remove any text after the HTML content ends
    const htmlEndPatterns = ['</article>', '</div>', '###', 'Excerpt:', 'Affiliate'];
    for (const pattern of htmlEndPatterns) {
      const lastIndex = content.lastIndexOf(pattern);
      if (lastIndex > 0 && pattern.startsWith('</')) {
        content = content.substring(0, lastIndex + pattern.length);
        break;
      } else if (lastIndex > 0 && !pattern.startsWith('</')) {
        content = content.substring(0, lastIndex);
        break;
      }
    }

    // Parse affiliate link suggestions
    const affiliateSuggestions: Array<{ url: string; description: string }> = [];
    const affiliateSection = generatedText.substring(content.length);
    const affiliatePattern = /\d+\.\s*\*\*([^*]+)\*\*[:\s-]*([^\n]+)/g;
    let match;

    while ((match = affiliatePattern.exec(affiliateSection)) !== null) {
      if (match[1] && match[2]) {
        affiliateSuggestions.push({
          url: '',
          description: `${match[1].trim()}: ${match[2].trim()}`
        });
      }
    }

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
