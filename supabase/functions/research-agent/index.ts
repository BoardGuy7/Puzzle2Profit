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

    // Fetch the last 5 research entries to build context
    const { data: previousResearch } = await supabase
      .from('trends')
      .select('topic, summary, tools_mentioned, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Build context from previous research
    const previousContext = previousResearch && previousResearch.length > 0
      ? `\n\nPrevious research topics covered:\n${previousResearch.map((r, i) =>
          `${i + 1}. ${r.topic} (Tools: ${r.tools_mentioned.join(', ')})`
        ).join('\n')}\n\nBuild upon these topics with fresh, complementary insights that create a progressive learning journey.`
      : '';

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

    // Flatten all topics into a single array for selection
    const allTopics = Object.values(strategicCycles).flat();

    // Determine which topic to research (custom or next in cycle)
    let researchTopic;
    if (requestData.topic) {
      researchTopic = requestData.topic;
    } else {
      // Find topics not yet researched
      const researchedTopics = previousResearch?.map(r => r.topic) || [];
      const unrelearnedTopics = allTopics.filter(t => !researchedTopics.includes(t));

      if (unrelearnedTopics.length > 0) {
        researchTopic = unrelearnedTopics[0];
      } else {
        // All topics covered, start fresh cycle
        researchTopic = allTopics[0];
      }
    }

    const prompt = `You are the lead researcher for the world's most elite AI automation blog for solopreneurs. Your mission is to keep readers on the absolute cutting edge of AI business automation.

Research Topic: ${researchTopic}

Your task:
1. Provide a compelling 200-300 word summary of the TOP 3 most impactful trends happening RIGHT NOW (2025) in this area. Focus on actionable insights that give solopreneurs competitive advantages.

2. Identify 4-6 specific, real AI tools that enable these trends. For EACH tool provide:
   - Tool name
   - Brief description (1-2 sentences)
   - Official website URL
   - Affiliate program information (if available, include sign-up link or note if they have an affiliate program)
   - Pricing tier (Free/Freemium/Paid with approximate pricing)
   - Top 2-3 key features

3. Provide 3-5 actionable insights or tips that readers can implement immediately.

4. Create EXACTLY 7 blog post ideas (one for each day of the week) following this framework:
   - Day 1 (Build): Foundation/Setup/Infrastructure
   - Day 2 (Attract): Marketing/Outreach/Visibility
   - Day 3 (Convert): Sales/Persuasion/Closing
   - Day 4 (Deliver): Fulfillment/Product/Service Delivery
   - Day 5 (Support): Customer Success/Retention
   - Day 6 (Profit): Revenue/Optimization/Growth
   - Day 7 (Rest): Strategic Planning/Reflection/Recovery

Each blog idea should:
- Have a specific, actionable title (not generic)
- Include a 2-sentence description explaining the practical value
- Reference specific AI tools when possible
- Build progressive mastery (Day 1 = beginner friendly, Day 7 = advanced strategic thinking)

${previousContext}

Format as JSON:
{
  "summary": "...",
  "tools": ["Tool Name 1", "Tool Name 2", ...],
  "tools_detailed": [
    {
      "name": "Tool Name",
      "description": "Brief description",
      "website": "https://...",
      "affiliate_program": "Yes - https://affiliate-link or No or Unknown",
      "pricing": "Free tier available, Pro at $X/month",
      "key_features": ["Feature 1", "Feature 2", "Feature 3"]
    }
  ],
  "key_insights": [
    "Actionable insight 1...",
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
            content: 'You are an AI research assistant specializing in business automation trends and tools for solopreneurs.'
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
      topic: researchTopic,
      summary: parsedData.summary || responseText.substring(0, 500),
      tools_mentioned: parsedData.tools || [],
      tools_detailed: parsedData.tools_detailed || [],
      key_insights: parsedData.key_insights || [],
      blog_ideas: parsedData.blog_ideas || [],
      source: 'grok-api'
    });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        topic: researchTopic,
        message: 'Research completed and saved'
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
