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
    const grokApiKey = Deno.env.get('XAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!grokApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const topics = [
      'E-commerce automation',
      'Social media AI tools',
      'Content creation automation',
      'Customer support AI',
      'Email marketing automation',
      'Data analysis tools'
    ];

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `Research the latest trends in ${randomTopic} for solopreneurs in 2025. 

Provide:
1. A 200-word summary of the top 3 current trends
2. List 3-5 specific AI tools mentioned
3. Suggest 2-3 blog post ideas based on these trends, categorized by the 7-day cycle: Build, Attract, Convert, Deliver, Support, Profit, Rest

Format the response as JSON with keys: summary, tools, blog_ideas`;

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
            content: 'You are an AI research assistant specializing in business automation trends and tools for solopreneurs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'grok-beta',
        temperature: 0.6,
      }),
    });

    if (!grokResponse.ok) {
      throw new Error('Grok API request failed');
    }

    const grokData = await grokResponse.json();
    const responseText = grokData.choices[0]?.message?.content || '';

    let parsedData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        summary: responseText.substring(0, 500),
        tools: [],
        blog_ideas: []
      };
    } catch (e) {
      parsedData = {
        summary: responseText.substring(0, 500),
        tools: [],
        blog_ideas: []
      };
    }

    const { error } = await supabase.from('trends').insert({
      topic: randomTopic,
      summary: parsedData.summary || responseText.substring(0, 500),
      tools_mentioned: parsedData.tools || [],
      blog_ideas: parsedData.blog_ideas || [],
      source: 'grok-api'
    });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        topic: randomTopic,
        data: parsedData
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