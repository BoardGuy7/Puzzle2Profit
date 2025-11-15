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
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get format from query params (json, csv, or markdown)
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json';

    // Fetch all research trends
    const { data: trends, error } = await supabase
      .from('trends')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (format === 'markdown') {
      // Generate markdown format
      let markdown = '# AI Automation Research Export\n\n';
      markdown += `Generated: ${new Date().toISOString()}\n\n`;
      markdown += `Total Research Entries: ${trends?.length || 0}\n\n`;
      markdown += '---\n\n';

      trends?.forEach((trend, index) => {
        markdown += `## ${index + 1}. ${trend.topic}\n\n`;
        markdown += `**Date:** ${new Date(trend.created_at).toLocaleDateString()}\n\n`;
        markdown += `### Summary\n${trend.summary}\n\n`;

        if (trend.tools_mentioned && trend.tools_mentioned.length > 0) {
          markdown += `### Tools Mentioned\n`;
          trend.tools_mentioned.forEach((tool: string) => {
            markdown += `- ${tool}\n`;
          });
          markdown += '\n';
        }

        if (trend.blog_ideas && trend.blog_ideas.length > 0) {
          markdown += `### Blog Ideas (${trend.blog_ideas.length})\n\n`;
          trend.blog_ideas.forEach((idea: any) => {
            markdown += `#### ${idea.day}: ${idea.title}\n`;
            markdown += `${idea.description}\n\n`;
          });
        }

        markdown += '---\n\n';
      });

      return new Response(markdown, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/markdown',
          'Content-Disposition': 'attachment; filename="research-export.md"'
        },
      });
    } else if (format === 'csv') {
      // Generate CSV format
      let csv = 'Date,Topic,Summary,Tools,Blog Ideas Count\n';

      trends?.forEach((trend) => {
        const date = new Date(trend.created_at).toISOString();
        const topic = `"${trend.topic.replace(/"/g, '""')}"`;
        const summary = `"${trend.summary.replace(/"/g, '""')}"`;
        const tools = `"${trend.tools_mentioned.join(', ')}"`;
        const blogIdeasCount = trend.blog_ideas?.length || 0;

        csv += `${date},${topic},${summary},${tools},${blogIdeasCount}\n`;
      });

      return new Response(csv, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="research-export.csv"'
        },
      });
    } else {
      // Default JSON format
      return new Response(
        JSON.stringify({
          generated_at: new Date().toISOString(),
          total_entries: trends?.length || 0,
          research: trends
        }, null, 2),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
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
