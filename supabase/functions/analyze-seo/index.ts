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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Analyzing SEO for URL:', url);

    // Validate URL
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
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

    console.log('SEO analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: seoData,
        score: seoScore,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-seo function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
