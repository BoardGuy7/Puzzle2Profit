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

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get format and ids from query params
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json';
    const idsParam = url.searchParams.get('ids');

    // Build query
    let query = supabase
      .from('trends')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by specific IDs if provided
    if (idsParam) {
      const ids = idsParam.split(',');
      query = query.in('id', ids);
    }

    const { data: trends, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (format === 'pdf') {
      // Generate HTML for PDF printing
      let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Automation Research Export</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #14b8a6;
      border-bottom: 3px solid #14b8a6;
      padding-bottom: 10px;
    }
    h2 {
      color: #0d9488;
      margin-top: 30px;
      page-break-after: avoid;
    }
    h3 {
      color: #0f766e;
      margin-top: 20px;
    }
    h4 {
      color: #115e59;
      margin-top: 15px;
    }
    .meta {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 30px;
    }
    .tool-badge {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      padding: 4px 12px;
      border-radius: 12px;
      margin: 4px;
      font-size: 0.85em;
      font-weight: 600;
    }
    .blog-idea {
      background: #f8fafc;
      border-left: 4px solid #14b8a6;
      padding: 15px;
      margin: 10px 0;
      page-break-inside: avoid;
    }
    .category-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: bold;
      color: white;
      margin-right: 10px;
    }
    .category-build { background: #3b82f6; }
    .category-attract { background: #14b8a6; }
    .category-convert { background: #f97316; }
    .category-deliver { background: #eab308; }
    .category-support { background: #ec4899; }
    .category-profit { background: #22c55e; }
    .category-rest { background: #64748b; }
    .separator {
      border-top: 2px solid #e2e8f0;
      margin: 40px 0;
    }
    @media print {
      body { padding: 0; }
      h2 { page-break-before: always; }
    }
  </style>
</head>
<body>
  <h1>AI Automation Research Export</h1>
  <div class="meta">
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Total Research Entries:</strong> ${trends?.length || 0}</p>
  </div>
`;

      trends?.forEach((trend, index) => {
        if (index > 0) html += '<div class="separator"></div>';

        html += `
  <h2>${index + 1}. ${trend.topic}</h2>
  <p class="meta"><strong>Date:</strong> ${new Date(trend.created_at).toLocaleDateString()}</p>

  <h3>Summary</h3>
  <p>${trend.summary}</p>
`;

        if (trend.tools_mentioned && trend.tools_mentioned.length > 0) {
          html += `
  <h3>Tools Mentioned</h3>
  <div>`;
          trend.tools_mentioned.forEach((tool: string) => {
            html += `<span class="tool-badge">${tool}</span>`;
          });
          html += `</div>`;
        }

        if (trend.blog_ideas && trend.blog_ideas.length > 0) {
          html += `
  <h3>Blog Ideas (${trend.blog_ideas.length})</h3>`;
          trend.blog_ideas.forEach((idea: any) => {
            const categoryClass = `category-${idea.day.toLowerCase()}`;
            html += `
  <div class="blog-idea">
    <div><span class="${categoryClass} category-badge">${idea.day}</span><strong>${idea.title}</strong></div>
    <p>${idea.description}</p>
  </div>`;
          });
        }
      });

      html += `
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
        },
      });
    } else if (format === 'markdown') {
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
