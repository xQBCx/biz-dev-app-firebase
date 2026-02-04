import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple HTML to text extraction
function extractTextFromHtml(html: string): { text: string; title: string; description: string; links: string[] } {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // Extract Open Graph data
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : '';
  const ogDesc = ogDescMatch ? ogDescMatch[1].trim() : '';

  // Extract all links
  const linkMatches = html.matchAll(/<a[^>]*href=["']([^"'#][^"']*)["'][^>]*>/gi);
  const links: string[] = [];
  for (const match of linkMatches) {
    if (match[1] && !match[1].startsWith('javascript:')) {
      links.push(match[1]);
    }
  }

  // Remove script and style tags
  let cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Extract text from specific content areas
  const mainContent = cleanHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ||
                      cleanHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ||
                      cleanHtml.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] ||
                      cleanHtml;

  // Remove all remaining HTML tags
  let text = mainContent
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  return {
    text,
    title: ogTitle || title,
    description: ogDesc || description,
    links: [...new Set(links)].slice(0, 20) // Unique links, max 20
  };
}

// Handle TikTok specifically - they block scrapers heavily
function isTikTokUrl(url: string): boolean {
  return url.includes('tiktok.com');
}

// Handle social media platforms that need special handling
function getSocialMediaNote(url: string): string | null {
  if (url.includes('tiktok.com')) {
    return "TikTok videos require their app/website to view. The video content cannot be directly scraped due to their anti-bot protections. To analyze TikTok content, please describe the video or provide key details from what you see.";
  }
  if (url.includes('instagram.com')) {
    return "Instagram content is protected and cannot be directly scraped. Please describe the content or provide a screenshot.";
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[scrape-url] Scraping: ${url}`);

    // Check for social media platforms that block scraping
    const socialNote = getSocialMediaNote(url);
    if (socialNote) {
      console.log(`[scrape-url] Social media platform detected, returning note`);
      return new Response(
        JSON.stringify({
          success: true,
          url,
          title: "Social Media Content",
          description: socialNote,
          text: socialNote,
          links: [],
          note: socialNote,
          scraped: false
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Attempt to fetch the URL with various user agents
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
    ];

    let html = "";
    let fetchSuccess = false;
    let lastError = "";

    for (const userAgent of userAgents) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
          },
          redirect: "follow"
        });

        if (response.ok) {
          html = await response.text();
          fetchSuccess = true;
          console.log(`[scrape-url] Successfully fetched with user agent: ${userAgent.substring(0, 30)}...`);
          break;
        } else {
          lastError = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Unknown fetch error";
        console.log(`[scrape-url] Failed with user agent, trying next...`);
      }
    }

    if (!fetchSuccess || !html) {
      console.error(`[scrape-url] All fetch attempts failed: ${lastError}`);
      return new Response(
        JSON.stringify({
          success: false,
          url,
          error: `Failed to fetch URL: ${lastError}`,
          note: "The website may be blocking automated requests or require authentication."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract content
    const extracted = extractTextFromHtml(html);
    
    // Truncate text if too long
    const maxTextLength = 50000;
    const truncatedText = extracted.text.length > maxTextLength 
      ? extracted.text.substring(0, maxTextLength) + "... [truncated]"
      : extracted.text;

    console.log(`[scrape-url] Extracted ${truncatedText.length} chars, ${extracted.links.length} links`);

    return new Response(
      JSON.stringify({
        success: true,
        url,
        title: extracted.title,
        description: extracted.description,
        text: truncatedText,
        links: extracted.links,
        scraped: true,
        contentLength: html.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[scrape-url] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
