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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Automation Research Export - ${new Date().toLocaleDateString()}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
      padding: 40px;
      max-width: 1000px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 4px solid #14b8a6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #14b8a6;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .meta {
      color: #666;
      font-size: 14px;
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .research-entry {
      margin-bottom: 50px;
      page-break-inside: avoid;
    }
    h2 {
      color: #0d9488;
      font-size: 24px;
      margin-bottom: 15px;
      padding-top: 20px;
    }
    .entry-meta {
      color: #888;
      font-size: 13px;
      margin-bottom: 15px;
    }
    h3 {
      color: #0f766e;
      font-size: 18px;
      margin: 20px 0 10px 0;
    }
    .summary {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      line-height: 1.8;
    }
    .tools-section {
      margin: 20px 0;
    }
    .tool-badge {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      padding: 6px 14px;
      border-radius: 16px;
      margin: 5px 5px 5px 0;
      font-size: 13px;
      font-weight: 600;
    }
    .tool-detailed {
      background: #ffffff;
      border: 2px solid #e0f2fe;
      border-radius: 8px;
      padding: 15px;
      margin: 15px 0;
      page-break-inside: avoid;
    }
    .tool-name {
      font-size: 16px;
      font-weight: 700;
      color: #0369a1;
      margin-bottom: 8px;
    }
    .tool-description {
      color: #4b5563;
      margin-bottom: 10px;
      line-height: 1.5;
    }
    .tool-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .tool-meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .tool-meta-label {
      font-weight: 600;
      color: #6b7280;
    }
    .tool-website {
      color: #0369a1;
      text-decoration: none;
      word-break: break-all;
    }
    .tool-affiliate {
      background: #dcfce7;
      color: #166534;
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 12px;
    }
    .tool-features {
      margin-top: 10px;
    }
    .tool-features ul {
      margin: 5px 0 0 20px;
      padding: 0;
    }
    .tool-features li {
      color: #374151;
      margin: 3px 0;
    }
    .insights-section {
      background: #fffbeb;
      border-left: 5px solid #f59e0b;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .insights-section ul {
      margin: 10px 0 0 20px;
      padding: 0;
    }
    .insights-section li {
      color: #92400e;
      margin: 8px 0;
      line-height: 1.6;
    }
    .blog-ideas-section {
      margin-top: 25px;
    }
    .blog-idea {
      background: #f8fafc;
      border-left: 5px solid #14b8a6;
      padding: 15px 20px;
      margin: 12px 0;
      page-break-inside: avoid;
      border-radius: 4px;
    }
    .blog-idea-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .category-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .category-build { background: #3b82f6; }
    .category-attract { background: #14b8a6; }
    .category-convert { background: #f97316; }
    .category-deliver { background: #eab308; }
    .category-support { background: #ec4899; }
    .category-profit { background: #22c55e; }
    .category-rest { background: #64748b; }
    .blog-title {
      font-weight: 600;
      color: #1a1a1a;
      font-size: 15px;
    }
    .blog-description {
      color: #4b5563;
      font-size: 14px;
      line-height: 1.6;
    }
    .separator {
      border-top: 2px solid #e5e7eb;
      margin: 40px 0;
    }
    @media print {
      body {
        padding: 20px;
      }
      .research-entry {
        page-break-after: always;
      }
      .research-entry:last-child {
        page-break-after: auto;
      }
      h2 {
        page-break-after: avoid;
      }
      .blog-idea {
        page-break-inside: avoid;
      }
    }
    @page {
      margin: 2cm;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 AI Automation Research Export</h1>
    <div class="meta">
      <div class="meta-item">
        <strong>Generated:</strong> ${new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
      <div class="meta-item">
        <strong>Total Research Entries:</strong> ${trends?.length || 0}
      </div>
    </div>
  </div>
`;

      trends?.forEach((trend, index) => {
        html += `
  <div class="research-entry">
    <h2>${index + 1}. ${trend.topic}</h2>
    <p class="entry-meta">📅 ${new Date(trend.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>

    <h3>📝 Summary</h3>
    <div class="summary">${trend.summary}</div>
`;

        // Display detailed tools information if available
        if (trend.tools_detailed && trend.tools_detailed.length > 0) {
          html += `
    <div class="tools-section">
      <h3>🛠️ Tools & Platforms for Affiliate Sign-Up (${trend.tools_detailed.length})</h3>`;

          trend.tools_detailed.forEach((tool: any) => {
            html += `
      <div class="tool-detailed">
        <div class="tool-name">${tool.name}</div>
        <div class="tool-description">${tool.description}</div>
        <div class="tool-meta">
          <div class="tool-meta-item">
            <span class="tool-meta-label">Website:</span>
            <a href="${tool.website}" class="tool-website" target="_blank">${tool.website}</a>
          </div>
          <div class="tool-meta-item">
            <span class="tool-meta-label">Pricing:</span>
            <span>${tool.pricing}</span>
          </div>
        </div>`;

            // Highlight affiliate program info
            if (tool.affiliate_program && tool.affiliate_program.toLowerCase().includes('yes')) {
              html += `
        <div class="tool-meta-item">
          <span class="tool-affiliate">✓ AFFILIATE PROGRAM: ${tool.affiliate_program}</span>
        </div>`;
            } else {
              html += `
        <div class="tool-meta-item">
          <span style="color: #6b7280; font-size: 12px;">Affiliate: ${tool.affiliate_program || 'Unknown'}</span>
        </div>`;
            }

            if (tool.key_features && tool.key_features.length > 0) {
              html += `
        <div class="tool-features">
          <strong>Key Features:</strong>
          <ul>`;
              tool.key_features.forEach((feature: string) => {
                html += `<li>${feature}</li>`;
              });
              html += `
          </ul>
        </div>`;
            }

            html += `
      </div>`;
          });

          html += `
    </div>`;
        } else if (trend.tools_mentioned && trend.tools_mentioned.length > 0) {
          // Fallback to simple tool badges if detailed info not available
          html += `
    <div class="tools-section">
      <h3>🛠️ Tools & Platforms (${trend.tools_mentioned.length})</h3>
      <div>`;
          trend.tools_mentioned.forEach((tool: string) => {
            html += `<span class="tool-badge">${tool}</span>`;
          });
          html += `
      </div>
    </div>`;
        }

        // Display key insights if available
        if (trend.key_insights && trend.key_insights.length > 0) {
          html += `
    <div class="insights-section">
      <h3>💡 Key Actionable Insights</h3>
      <ul>`;
          trend.key_insights.forEach((insight: string) => {
            html += `<li>${insight}</li>`;
          });
          html += `
      </ul>
    </div>`;
        }

        if (trend.blog_ideas && trend.blog_ideas.length > 0) {
          html += `
    <div class="blog-ideas-section">
      <h3>💡 Blog Content Ideas (${trend.blog_ideas.length})</h3>`;
          trend.blog_ideas.forEach((idea: any) => {
            const categoryClass = `category-${idea.day.toLowerCase()}`;
            html += `
      <div class="blog-idea">
        <div class="blog-idea-header">
          <span class="${categoryClass} category-badge">${idea.day}</span>
          <span class="blog-title">${idea.title}</span>
        </div>
        <p class="blog-description">${idea.description}</p>
      </div>`;
          });
          html += `
    </div>`;
        }

        html += `
  </div>`;
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
