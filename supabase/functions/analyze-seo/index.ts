import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SEOData {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  keywords?: string;
  url: string;
  h1?: string;
  metaRobots?: string;
  lang?: string;
  viewport?: string;
  charset?: string;
}

interface SEOScore {
  total: number;
  breakdown: {
    basic: number;
    social: number;
    technical: number;
  };
}

const extractMetaData = (html: string, url: string): SEOData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const getMetaContent = (name: string, property?: string) => {
    if (property) {
      const element = doc.querySelector(`meta[property="${property}"]`);
      return element?.getAttribute('content') || '';
    }
    const element = doc.querySelector(`meta[name="${name}"]`) || 
                   doc.querySelector(`meta[property="${name}"]`);
    return element?.getAttribute('content') || '';
  };

  const title = doc.querySelector('title')?.textContent || '';
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
  const h1 = doc.querySelector('h1')?.textContent || '';
  const htmlElement = doc.querySelector('html');
  const lang = htmlElement?.getAttribute('lang') || '';

  return {
    title,
    description: getMetaContent('description'),
    ogTitle: getMetaContent('', 'og:title'),
    ogDescription: getMetaContent('', 'og:description'),
    ogImage: getMetaContent('', 'og:image'),
    ogType: getMetaContent('', 'og:type'),
    twitterCard: getMetaContent('twitter:card'),
    twitterTitle: getMetaContent('twitter:title'),
    twitterDescription: getMetaContent('twitter:description'),
    twitterImage: getMetaContent('twitter:image'),
    canonical,
    keywords: getMetaContent('keywords'),
    h1,
    metaRobots: getMetaContent('robots'),
    lang,
    viewport: getMetaContent('viewport'),
    charset: doc.querySelector('meta[charset]')?.getAttribute('charset') || '',
    url
  };
};

const calculateSEOScore = (data: SEOData): SEOScore => {
  let basicScore = 0;
  let socialScore = 0;
  let technicalScore = 0;

  // Basic SEO (40 points max)
  if (data.title) basicScore += 15;
  if (data.description) basicScore += 15;
  if (data.h1) basicScore += 10;

  // Social Media (30 points max)
  if (data.ogTitle || data.title) socialScore += 8;
  if (data.ogDescription || data.description) socialScore += 8;
  if (data.ogImage) socialScore += 14;

  // Technical SEO (30 points max)
  if (data.canonical) technicalScore += 10;
  if (data.lang) technicalScore += 5;
  if (data.viewport) technicalScore += 5;
  if (data.charset) technicalScore += 5;
  if (!data.metaRobots || !data.metaRobots.includes('noindex')) technicalScore += 5;

  const total = basicScore + socialScore + technicalScore;

  return {
    total,
    breakdown: {
      basic: basicScore,
      social: socialScore,
      technical: technicalScore
    }
  };
};

// Simple in-memory cache for demo (use Redis/Supabase for production)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

// Rate limiting (simple in-memory, use proper solution for production)
const rateLimits = new Map<string, number[]>();
const RATE_LIMIT = 10; // requests per minute

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const requests = rateLimits.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimits.set(ip, recentRequests);
  return true;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a minute.',
          retryAfter: 60 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { url, urls } = await req.json();

    // Support batch analysis
    if (urls && Array.isArray(urls)) {
      if (urls.length > 5) {
        return new Response(
          JSON.stringify({ error: 'Maximum 5 URLs allowed per batch request' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const results = await Promise.all(
        urls.map(async (u: string) => {
          try {
            // Check cache
            const cached = cache.get(u);
            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
              return { url: u, ...cached.data, cached: true };
            }

            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
            
            const data = await response.json();
            if (!data.contents) throw new Error('No content received');

            const seoData = extractMetaData(data.contents, u);
            const seoScore = calculateSEOScore(seoData);
            const result = { data: seoData, score: seoScore, success: true };
            
            // Cache result
            cache.set(u, { data: result, timestamp: Date.now() });
            
            return { url: u, ...result };
          } catch (error) {
            return { 
              url: u, 
              success: false, 
              error: error instanceof Error ? error.message : 'Analysis failed' 
            };
          }
        })
      );

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Single URL analysis
    if (!url) {
      return new Response(
        JSON.stringify({ 
          error: 'URL parameter is required',
          hint: 'Send {"url": "https://example.com"} or {"urls": ["https://example.com"]} for batch' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Analyzing SEO for URL:', url);

    // Check cache
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Returning cached result for:', url);
      return new Response(
        JSON.stringify({ ...cached.data, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.match(/^https?:/)) {
        throw new Error('Only HTTP(S) URLs are supported');
      }
    } catch {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid URL format',
          hint: 'Please provide a valid URL starting with http:// or https://' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch website content
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    const data = await response.json();

    if (!data.contents) {
      throw new Error('No content received from the website');
    }

    // Extract and analyze SEO data
    const seoData = extractMetaData(data.contents, url);
    const seoScore = calculateSEOScore(seoData);
    
    const result = {
      success: true,
      data: seoData,
      score: seoScore,
      cached: false
    };

    // Cache the result
    cache.set(url, { data: result, timestamp: Date.now() });

    console.log('SEO analysis completed successfully');

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-seo function:', error);
    
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Failed to fetch the website. The site may be blocking requests or experiencing issues.';
        statusCode = 502;
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        hint: statusCode === 502 ? 'Try a different URL or check if the website is accessible' : undefined
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
