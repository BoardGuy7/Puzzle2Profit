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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { trend_id, week_number } = await req.json();

    if (!trend_id) {
      throw new Error('trend_id is required');
    }

    // Fetch the research trend
    const { data: trend, error: trendError } = await supabase
      .from('trends')
      .select('*, paths:path_id(*)')
      .eq('id', trend_id)
      .single();

    if (trendError || !trend) {
      throw new Error('Trend not found: ' + trendError?.message);
    }

    if (trend.tools_populated) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Tools from this research have already been populated'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!trend.tools_detailed || trend.tools_detailed.length === 0) {
      throw new Error('No detailed tools found in this research');
    }

    // Determine week number (1-4 cycle based on current week or manual input)
    const currentWeekNumber = week_number || Math.ceil((new Date().getDate() / 7)) % 4 || 4;

    const populatedTools = [];
    const errors = [];

    // Process each tool from the research
    for (const tool of trend.tools_detailed) {
      try {
        // Check if tool already exists for this path (to avoid duplicates)
        const { data: existingTool } = await supabase
          .from('tech_stacks')
          .select('id, affiliate_url')
          .eq('path_id', trend.path_id)
          .eq('name', tool.name)
          .maybeSingle();

        if (existingTool) {
          // Tool exists - update last_used_week and mark as selected
          const { error: updateError } = await supabase
            .from('tech_stacks')
            .update({
              selected_for_week: true,
              last_used_week: new Date().toISOString().split('T')[0],
              week_number: currentWeekNumber,
              tools_detailed_source: tool
            })
            .eq('id', existingTool.id);

          if (updateError) {
            errors.push(`Failed to update ${tool.name}: ${updateError.message}`);
          } else {
            populatedTools.push({
              name: tool.name,
              status: 'reused',
              hasAffiliateLink: !!existingTool.affiliate_url
            });
          }
        } else {
          // New tool - create entry with pending status
          const hasAffiliateInfo = tool.affiliate_program &&
            (tool.affiliate_program.toLowerCase().includes('yes') ||
             tool.affiliate_program.toLowerCase().includes('available'));

          const { data: newTool, error: insertError } = await supabase
            .from('tech_stacks')
            .insert({
              path_id: trend.path_id,
              name: tool.name,
              category: trend.paths?.tech_stack_focus || 'Uncategorized',
              description: tool.description,
              website_url: tool.website,
              pricing_model: tool.pricing,
              key_features: tool.key_features || [],
              selected_for_week: true,
              auto_populated: true,
              week_number: currentWeekNumber,
              signup_status: hasAffiliateInfo ? 'pending' : 'declined',
              affiliate_notes: tool.affiliate_program,
              tools_detailed_source: tool,
              priority_score: 70
            })
            .select()
            .single();

          if (insertError) {
            errors.push(`Failed to create ${tool.name}: ${insertError.message}`);
          } else {
            populatedTools.push({
              name: tool.name,
              status: 'new',
              needsAffiliateSignup: hasAffiliateInfo
            });
          }
        }
      } catch (error: any) {
        errors.push(`Error processing ${tool.name}: ${error.message}`);
      }
    }

    // Mark the trend as populated
    await supabase
      .from('trends')
      .update({
        tools_populated: true,
        week_number: currentWeekNumber
      })
      .eq('id', trend_id);

    const needsSignup = populatedTools.filter(t => t.status === 'new' && t.needsAffiliateSignup);
    const reused = populatedTools.filter(t => t.status === 'reused' && t.hasAffiliateLink);
    const needsLinks = populatedTools.filter(t => t.status === 'reused' && !t.hasAffiliateLink);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Populated ${populatedTools.length} tools for Week ${currentWeekNumber}`,
        summary: {
          total: populatedTools.length,
          newTools: populatedTools.filter(t => t.status === 'new').length,
          reusedTools: populatedTools.filter(t => t.status === 'reused').length,
          needsAffiliateSignup: needsSignup.length,
          readyToUse: reused.length,
          needsAffiliateLinks: needsLinks.length
        },
        tools: populatedTools,
        errors: errors.length > 0 ? errors : undefined,
        nextSteps: [
          needsSignup.length > 0 ? `Sign up for ${needsSignup.length} new affiliate programs` : null,
          needsLinks.length > 0 ? `Add affiliate links for ${needsLinks.length} existing tools` : null,
          reused.length > 0 ? `${reused.length} tools ready with existing affiliate links` : null
        ].filter(Boolean)
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
