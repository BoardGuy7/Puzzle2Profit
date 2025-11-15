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

    const {
      tech_stack_id,
      contract_text,
      contract_url,
      affiliate_network,
      tracking_id
    } = await req.json();

    if (!tech_stack_id || !contract_text) {
      throw new Error('tech_stack_id and contract_text are required');
    }

    // Get tech stack details
    const { data: techStack, error: techStackError } = await supabase
      .from('tech_stacks')
      .select('name, category, website_url')
      .eq('id', tech_stack_id)
      .single();

    if (techStackError) {
      throw new Error('Tech stack not found: ' + techStackError.message);
    }

    // AI Agent: Elite Affiliate Marketing Expert
    const analysisPrompt = `You are an elite affiliate marketing expert with 20+ years of experience analyzing affiliate contracts.
Your specialty is extracting key terms, identifying risks, and providing strategic recommendations.

ANALYZE THIS AFFILIATE CONTRACT:

Tool: ${techStack.name}
Network: ${affiliate_network || 'Direct'}
Website: ${techStack.website_url}

CONTRACT TEXT:
${contract_text}

PROVIDE COMPREHENSIVE ANALYSIS IN THIS EXACT JSON FORMAT:

{
  "commission_structure": {
    "type": "percentage|flat_rate|hybrid|tiered",
    "primary_rate": "e.g., 20% or $50",
    "recurring_rate": "if applicable, or null",
    "tiers": [
      {"threshold": "sales count or amount", "rate": "commission at this tier"}
    ],
    "cookie_duration_days": 30
  },
  "payment_terms": {
    "frequency": "monthly|bi-weekly|weekly|on_demand",
    "threshold": 50.00,
    "methods": ["PayPal", "Bank Transfer", "Wire"],
    "payout_delay_days": 30
  },
  "restrictions": {
    "geographic": ["US only", "Worldwide except X"],
    "traffic": ["No PPC on brand terms", "No incentivized traffic"],
    "promotional": ["No coupon sites", "No email spam"],
    "compliance": ["Must disclose affiliate relationship", "GDPR compliant"],
    "prohibited_keywords": ["brand name + coupon", "free", "discount"]
  },
  "analysis": {
    "summary": "2-3 sentence executive summary of this contract",
    "rating": 8.5,
    "pros": [
      "High commission rate competitive in industry",
      "Long cookie duration maximizes attribution",
      "Recurring commissions for subscription products"
    ],
    "cons": [
      "High payment threshold may delay cashouts",
      "Strict PPC restrictions limit marketing channels",
      "Geographic limitations reduce audience reach"
    ],
    "risk_level": "low|medium|high",
    "recommendations": [
      "Focus on content marketing to comply with PPC restrictions",
      "Track performance closely in first 90 days to ensure profitability",
      "Negotiate lower payment threshold after proving performance"
    ]
  },
  "monitoring_setup": {
    "benchmarks": {
      "target_conversion_rate": 2.5,
      "target_epc": 1.50,
      "target_monthly_revenue": 500
    },
    "alert_thresholds": {
      "low_conversion_alert": 1.0,
      "high_bounce_alert": 70,
      "payment_due_alert": 7
    },
    "recommended_frequency": "daily|weekly|monthly"
  },
  "key_action_items": [
    "Set up UTM tracking parameters for all campaigns",
    "Create compliant disclosure language for content",
    "Schedule quarterly performance review with affiliate manager"
  ]
}

BE THOROUGH. Extract every relevant detail. If information is missing, note it in recommendations.`;

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
            content: 'You are an elite affiliate marketing consultant specializing in contract analysis. Provide detailed, actionable insights.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        model: 'grok-2-latest',
        temperature: 0.3,
      }),
    });

    if (!grokResponse.ok) {
      const errorText = await grokResponse.text();
      throw new Error(`AI analysis failed (${grokResponse.status}): ${errorText}`);
    }

    const grokData = await grokResponse.json();
    const responseText = grokData.choices[0]?.message?.content || '';

    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      throw new Error('Failed to parse AI analysis: ' + e.message);
    }

    if (!analysis) {
      throw new Error('AI did not return valid analysis');
    }

    // Store contract and analysis in database
    const { data: contract, error: contractError } = await supabase
      .from('affiliate_contracts')
      .insert({
        tech_stack_id: tech_stack_id,
        contract_text: contract_text,
        contract_url: contract_url,
        affiliate_network: affiliate_network,
        tracking_id: tracking_id,

        // Commission Structure
        commission_type: analysis.commission_structure?.type,
        commission_rate_primary: analysis.commission_structure?.primary_rate,
        commission_rate_recurring: analysis.commission_structure?.recurring_rate,
        commission_tiers: analysis.commission_structure?.tiers || [],
        cookie_duration_days: analysis.commission_structure?.cookie_duration_days,

        // Payment Terms
        payment_frequency: analysis.payment_terms?.frequency,
        payment_threshold: analysis.payment_terms?.threshold,
        payment_methods: analysis.payment_terms?.methods || [],
        payout_delay_days: analysis.payment_terms?.payout_delay_days,

        // Restrictions
        geographic_restrictions: analysis.restrictions?.geographic || [],
        traffic_restrictions: analysis.restrictions?.traffic || [],
        promotional_restrictions: analysis.restrictions?.promotional || [],
        compliance_requirements: analysis.restrictions?.compliance || [],
        prohibited_keywords: analysis.restrictions?.prohibited_keywords || [],

        // AI Analysis
        ai_analysis_summary: analysis.analysis?.summary,
        ai_rating: analysis.analysis?.rating,
        ai_pros: analysis.analysis?.pros || [],
        ai_cons: analysis.analysis?.cons || [],
        ai_recommendations: analysis.analysis?.recommendations || [],
        ai_risk_level: analysis.analysis?.risk_level,

        // Monitoring
        performance_benchmarks: analysis.monitoring_setup?.benchmarks || {},
        alert_thresholds: analysis.monitoring_setup?.alert_thresholds || {},
        monitoring_frequency: analysis.monitoring_setup?.recommended_frequency || 'daily',

        analyzed_at: new Date().toISOString(),
        last_reviewed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (contractError) {
      throw new Error('Failed to save contract: ' + contractError.message);
    }

    // Create initial monitoring alerts based on action items
    if (analysis.key_action_items && analysis.key_action_items.length > 0) {
      const alerts = analysis.key_action_items.map((item: string) => ({
        tech_stack_id: tech_stack_id,
        contract_id: contract.id,
        alert_type: 'optimization',
        severity: 'info',
        title: 'Action Required',
        description: item,
        ai_recommendations: [item],
        suggested_actions: [item]
      }));

      await supabase
        .from('affiliate_monitoring_alerts')
        .insert(alerts);
    }

    // Update tech stack with contract ID reference
    await supabase
      .from('tech_stacks')
      .update({
        signup_status: 'active',
        signup_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', tech_stack_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contract analyzed successfully',
        contract_id: contract.id,
        analysis: {
          summary: analysis.analysis?.summary,
          rating: analysis.analysis?.rating,
          risk_level: analysis.analysis?.risk_level,
          pros_count: analysis.analysis?.pros?.length || 0,
          cons_count: analysis.analysis?.cons?.length || 0,
          recommendations_count: analysis.analysis?.recommendations?.length || 0,
          action_items_count: analysis.key_action_items?.length || 0
        }
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
