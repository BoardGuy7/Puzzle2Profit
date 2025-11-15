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
      return new Response(
        JSON.stringify({
          error: 'Missing required environment variables',
          details: {
            hasGrokKey: !!grokApiKey,
            hasSupabaseUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let requestData;
    try {
      requestData = await req.json();
    } catch {
      requestData = {};
    }

    // Fetch both paths
    const { data: paths } = await supabase
      .from('paths')
      .select('*')
      .order('slug');

    if (!paths || paths.length < 2) {
      throw new Error('Both paths (A and B) must be configured in the database');
    }

    const pathA = paths.find(p => p.slug === 'a');
    const pathB = paths.find(p => p.slug === 'b');

    // Strategic 30-day research cycles organized by business phase
    const strategicCycles = {
      'Week 1: Foundation Building': [
        'AI-powered no-code development platforms for rapid MVP creation',
        'Automated business infrastructure setup (legal, accounting, compliance)',
        'AI tools for market research and competitor analysis',
        'Intelligent product roadmap planning and feature prioritization',
        'Automated tech stack selection and integration planning',
        'AI-driven brand identity and positioning tools',
        'Smart business model validation and pivot detection'
      ],
      'Week 2: Audience Attraction': [
        'AI automation for social media outreach and engagement',
        'Advanced SEO automation and content optimization tools',
        'AI-powered influencer discovery and partnership automation',
        'Intelligent paid advertising optimization and budget allocation',
        'Automated email list building and lead magnet creation',
        'AI-driven content distribution and cross-platform syndication',
        'Smart community building and engagement automation'
      ],
      'Week 3: Conversion & Delivery': [
        'AI sales funnel optimization and A/B testing automation',
        'Intelligent pricing strategy and dynamic pricing tools',
        'Automated onboarding and user activation sequences',
        'AI-powered product recommendation engines',
        'Smart checkout optimization and cart abandonment recovery',
        'Automated course and digital product delivery systems',
        'AI-driven upsell and cross-sell automation'
      ],
      'Week 4: Support, Profit & Growth': [
        'AI customer support automation and chatbot intelligence',
        'Automated financial forecasting and profit optimization',
        'Intelligent churn prediction and retention automation',
        'AI-powered analytics dashboards and insight generation',
        'Automated referral programs and viral growth loops',
        'Smart resource allocation and burnout prevention tools',
        'AI-driven strategic planning and goal tracking systems'
      ]
    };

    const allTopics = Object.values(strategicCycles).flat();

    // Function to research for a specific path
    const researchForPath = async (path: any) => {
      // Fetch previous research for this path
      const { data: previousResearch } = await supabase
        .from('trends')
        .select('topic, summary, tools_mentioned, created_at')
        .eq('path_id', path.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const previousContext = previousResearch && previousResearch.length > 0
        ? `\n\nPrevious research for ${path.name}:\n${previousResearch.map((r, i) =>
            `${i + 1}. ${r.topic} (Tools: ${r.tools_mentioned.join(', ')})`
          ).join('\n')}\n\nBuild upon these topics with fresh insights.`
        : '';

      // Determine topic to research
      let researchTopic;
      if (requestData.topic) {
        researchTopic = requestData.topic;
      } else {
        const researchedTopics = previousResearch?.map(r => r.topic) || [];
        const unrelearnedTopics = allTopics.filter(t => !researchedTopics.includes(t));

        if (unrelearnedTopics.length > 0) {
          researchTopic = unrelearnedTopics[0];
        } else {
          researchTopic = allTopics[0];
        }
      }

      // Path-specific constraints
      const pathConstraints = path.slug === 'a'
        ? `CRITICAL: ${path.name} focuses on ${path.tech_stack_focus}.

        ONLY recommend NO-CODE and LOW-CODE tools such as:
        - Visual builders: Bubble, Webflow, Framer, Softr, Glide
        - Automation: Zapier, Make (Integromat), n8n, Tray.io
        - Databases: Airtable, NocoDB, Baserow
        - Forms: Typeform, Jotform, Tally
        - Landing pages: Carrd, Unbounce, Instapage
        - Email: Brevo, Mailchimp, ConvertKit
        - Payment: Stripe (no-code), Gumroad, Lemon Squeezy
        - Auth: Memberstack, Outseta

        DO NOT include: Code-based solutions, AI APIs requiring programming, developer tools`
        : `CRITICAL: ${path.name} focuses on ${path.tech_stack_focus}.

        ONLY recommend AI API and DEVELOPER tools such as:
        - AI APIs: OpenAI, Anthropic (Claude), Groq, Cohere, Replicate
        - AI Platforms: HuggingFace, LangChain, LlamaIndex
        - Development: Vercel, Railway, Render, Fly.io
        - Databases: Supabase, Firebase, PlanetScale, Neon
        - Vector DBs: Pinecone, Weaviate, Qdrant, Chroma
        - Monitoring: Sentry, PostHog, LogRocket
        - APIs: RapidAPI, Apify
        - Backend: FastAPI, Express, Next.js API routes

        DO NOT include: No-code builders, visual tools without APIs, drag-and-drop solutions`;

      const prompt = `You are researching for "${path.name}" which is focused on ${path.tech_stack_focus}.

Research Topic: ${researchTopic}

${pathConstraints}

Your task:
1. Provide a compelling 200-300 word summary of the TOP 3 most impactful trends happening RIGHT NOW (2025) for ${path.tech_stack_focus} in this area.

2. Identify 4-6 specific, real tools that match ${path.name}'s focus. For EACH tool provide:
   - Tool name
   - Brief description (1-2 sentences) explaining how it fits ${path.tech_stack_focus}
   - Official website URL
   - Affiliate program information (check if they have partner/affiliate programs)
   - Pricing tier (Free/Freemium/Paid with approximate pricing)
   - Top 2-3 key features

3. Provide 3-5 actionable insights specifically for solopreneurs using ${path.tech_stack_focus}.

4. Create EXACTLY 7 blog post ideas following this framework:
   - Day 1 (Build): Foundation/Setup/Infrastructure
   - Day 2 (Attract): Marketing/Outreach/Visibility
   - Day 3 (Convert): Sales/Persuasion/Closing
   - Day 4 (Deliver): Fulfillment/Product/Service Delivery
   - Day 5 (Support): Customer Success/Retention
   - Day 6 (Profit): Revenue/Optimization/Growth
   - Day 7 (Rest): Strategic Planning/Reflection/Recovery

Each blog idea must reference ${path.tech_stack_focus} tools.

${previousContext}

Format as JSON:
{
  "summary": "...",
  "tools": ["Tool Name 1", "Tool Name 2", ...],
  "tools_detailed": [
    {
      "name": "Tool Name",
      "description": "Brief description highlighting ${path.tech_stack_focus} fit",
      "website": "https://...",
      "affiliate_program": "Yes - details or No or Unknown",
      "pricing": "Free tier available, Pro at $X/month",
      "key_features": ["Feature 1", "Feature 2", "Feature 3"]
    }
  ],
  "key_insights": [
    "Actionable insight 1 for ${path.tech_stack_focus}...",
    "Actionable insight 2...",
    "Actionable insight 3..."
  ],
  "blog_ideas": [
    {"day": "Build", "title": "...", "description": "..."},
    {"day": "Attract", "title": "...", "description": "..."},
    {"day": "Convert", "title": "...", "description": "..."},
    {"day": "Deliver", "title": "...", "description": "..."},
    {"day": "Support", "title": "...", "description": "..."},
    {"day": "Profit", "title": "...", "description": "..."},
    {"day": "Rest", "title": "...", "description": "..."}
  ]
}`;

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
              content: `You are an AI research assistant specializing in ${path.tech_stack_focus} for solopreneurs. You MUST ONLY recommend tools that match this specific path's focus.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'grok-2-latest',
          temperature: 0.6,
        }),
      });

      if (!grokResponse.ok) {
        const errorText = await grokResponse.text();
        throw new Error(`Grok API request failed (${grokResponse.status}): ${errorText}`);
      }

      const grokData = await grokResponse.json();
      const responseText = grokData.choices[0]?.message?.content || '';

      let parsedData;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
          summary: responseText.substring(0, 500),
          tools: [],
          tools_detailed: [],
          key_insights: [],
          blog_ideas: []
        };
      } catch (e) {
        parsedData = {
          summary: responseText.substring(0, 500),
          tools: [],
          tools_detailed: [],
          key_insights: [],
          blog_ideas: []
        };
      }

      // Save to database with path_id
      const { error } = await supabase.from('trends').insert({
        path_id: path.id,
        topic: researchTopic,
        summary: parsedData.summary || responseText.substring(0, 500),
        tools_mentioned: parsedData.tools || [],
        tools_detailed: parsedData.tools_detailed || [],
        key_insights: parsedData.key_insights || [],
        blog_ideas: parsedData.blog_ideas || [],
        source: 'grok-api'
      });

      if (error) {
        throw new Error(`Database error for ${path.name}: ${error.message}`);
      }

      return {
        path: path.name,
        topic: researchTopic,
        toolCount: parsedData.tools?.length || 0
      };
    };

    // Research for both paths
    const results = await Promise.all([
      researchForPath(pathA),
      researchForPath(pathB)
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Research completed for both paths',
        results: results
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
