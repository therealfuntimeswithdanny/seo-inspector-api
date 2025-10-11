import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Search, ExternalLink, Image, FileText, Tag, Globe, AlertCircle, CheckCircle, Zap, TrendingUp, Eye, Share2, Target, Terminal, Code, Bug, Cpu, Database, Monitor, Server, Book } from 'lucide-react';

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

const SEOTester = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [seoScore, setSeoScore] = useState<SEOScore | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

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

  const analyzeSEO = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSeoData(null);

    try {
      setProgress(20);
      
      const urlObj = new URL(url);
      setProgress(40);
      
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      setProgress(70);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('No content received from the website');
      }

      setProgress(90);
      const extractedData = extractMetaData(data.contents, url);
      const score = calculateSEOScore(extractedData);
      
      setSeoData(extractedData);
      setSeoScore(score);
      setProgress(100);
      
      setTimeout(() => {
        setShowResults(true);
      }, 200);
      
      toast({
        title: "Success",
        description: "SEO analysis completed successfully",
      });
    } catch (err) {
      console.error('SEO Analysis Error:', err);
      let errorMessage = 'Failed to analyze website. ';
      
      if (err instanceof TypeError && err.message.includes('Invalid URL')) {
        errorMessage += 'Please enter a valid URL starting with http:// or https://';
      } else if (err instanceof Error) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please check the URL and try again.';
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (!error) {
        setTimeout(() => setProgress(0), 1000);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeSEO();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const AnimatedCounter = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (showResults) {
        let start = 0;
        const increment = value / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= value) {
            setCount(value);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
        return () => clearInterval(timer);
      }
    }, [value, duration, showResults]);

    return <span>{count}</span>;
  };

  const DataField = ({ label, value, isGood }: { label: string; value: string; isGood?: boolean }) => (
    <div className="bg-muted/20 p-3 rounded border-l-2 border-l-primary/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground font-mono text-xs">{label}</span>
        {value && isGood !== undefined && (
          <div className={`w-2 h-2 rounded-full ${isGood ? 'bg-green-500' : 'bg-orange-500'}`}></div>
        )}
      </div>
      <div className="text-foreground break-words font-mono text-sm">
        {value || <span className="text-red-500">❌ null</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Terminal-style background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255,255,255) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header - Dev Tool Style */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4 p-4 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                <div className="flex items-center gap-1 text-xs font-mono">
                  <span className="text-primary">$</span>
                  <span className="text-muted-foreground">seo-analyzer</span>
                  <span className="text-primary">--analyze</span>
                </div>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="text-muted-foreground font-mono">dev-tools</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <Link to="/docs">
                <Button variant="ghost" size="sm" className="text-xs font-mono">
                  <Book className="h-3 w-3 mr-1" />
                  API Docs
                </Button>
              </Link>
            </div>
            
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground font-mono flex items-center gap-2">
                <Code className="h-6 w-6 text-primary" />
                SEO Debug Console
              </h1>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                → Advanced web scraping and metadata analysis tool
              </p>
            </div>
          </div>

          {/* Command Input - Dev Tool Style */}
          <Card className="mb-8 animate-scale-in border border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-sm">
                <Monitor className="h-4 w-4 text-primary" />
                <span className="font-mono text-muted-foreground">Network Analysis</span>
                <Separator orientation="vertical" className="h-4" />
                <span className="font-mono text-xs text-muted-foreground">Status: Ready</span>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary font-mono text-sm">
                      →
                    </div>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="font-mono pl-8 pr-10 bg-muted/30 border-border focus:border-primary"
                      required
                    />
                    <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 font-mono text-sm"
                  >
                    {isLoading ? (
                      <>
                        <Cpu className="h-4 w-4 mr-2 animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Execute
                      </>
                    )}
                  </Button>
                </div>
                
                {isLoading && (
                  <div className="space-y-3 animate-fade-in bg-muted/30 p-3 rounded-md">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">$ curl -s {url} | seo-parse</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                    <div className="text-xs font-mono text-muted-foreground">
                      ⚡ Fetching HTML content... Parsing metadata... Calculating scores...
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Error Console */}
          {error && (
            <Card className="mb-8 border-destructive bg-destructive/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Bug className="h-4 w-4 text-destructive" />
                  <span className="font-mono text-destructive">Error Console</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-destructive/10 p-3 rounded font-mono text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <div className="text-destructive">
                      <div className="font-semibold">RuntimeError:</div>
                      <div className="text-xs mt-1">{error}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {seoData && seoScore && (
            <div className={`space-y-6 ${showResults ? 'animate-fade-in-up' : 'opacity-0'}`}>
              {/* Performance Metrics Dashboard */}
              <Card className="border border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm">Performance Metrics</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {getScoreGrade(seoScore.total)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Overall Score */}
                    <div className="md:col-span-1 bg-muted/30 p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold font-mono text-primary mb-1">
                          <AnimatedCounter value={seoScore.total} />
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">TOTAL SCORE</div>
                        <div className="text-xs text-muted-foreground">/100</div>
                      </div>
                    </div>
                    
                    {/* Breakdown */}
                    <div className="md:col-span-3 grid grid-cols-3 gap-3">
                      <div className="bg-muted/20 p-3 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-mono text-muted-foreground">BASIC</span>
                        </div>
                        <div className="text-xl font-bold font-mono">
                          <AnimatedCounter value={seoScore.breakdown.basic} />
                        </div>
                        <div className="text-xs text-muted-foreground">/40 pts</div>
                      </div>
                      
                      <div className="bg-muted/20 p-3 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <Share2 className="h-3 w-3 text-green-500" />
                          <span className="text-xs font-mono text-muted-foreground">SOCIAL</span>
                        </div>
                        <div className="text-xl font-bold font-mono">
                          <AnimatedCounter value={seoScore.breakdown.social} />
                        </div>
                        <div className="text-xs text-muted-foreground">/30 pts</div>
                      </div>
                      
                      <div className="bg-muted/20 p-3 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <Server className="h-3 w-3 text-orange-500" />
                          <span className="text-xs font-mono text-muted-foreground">TECH</span>
                        </div>
                        <div className="text-xl font-bold font-mono">
                          <AnimatedCounter value={seoScore.breakdown.technical} />
                        </div>
                        <div className="text-xs text-muted-foreground">/30 pts</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Indicators */}
              <Card className="border border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm">System Status</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                      {!!seoData.title ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>title</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                      {!!seoData.description ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>description</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                      {!!seoData.ogImage ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>og:image</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                      {!!seoData.canonical ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>canonical</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                      {!!seoData.h1 ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>h1</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                      {!!seoData.lang ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>lang</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                      {!!seoData.viewport ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>viewport</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                      {!!seoData.charset ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>charset</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Metadata */}
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-mono text-sm">Basic Metadata</span>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">
                        {seoScore.breakdown.basic}/40
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <DataField 
                      label="title" 
                      value={seoData.title || ''} 
                      isGood={!!seoData.title && seoData.title.length >= 30 && seoData.title.length <= 60}
                    />
                    <DataField 
                      label="description" 
                      value={seoData.description || ''} 
                      isGood={!!seoData.description && seoData.description.length >= 120 && seoData.description.length <= 160}
                    />
                    <DataField 
                      label="h1" 
                      value={seoData.h1 || ''} 
                      isGood={!!seoData.h1}
                    />
                    <DataField 
                      label="keywords" 
                      value={seoData.keywords || ''} 
                    />
                  </CardContent>
                </Card>

                {/* Open Graph Data */}
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-primary" />
                        <span className="font-mono text-sm">Social Media</span>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">
                        {seoScore.breakdown.social}/30
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <DataField 
                      label="og:title" 
                      value={seoData.ogTitle || ''} 
                      isGood={!!seoData.ogTitle}
                    />
                    <DataField 
                      label="og:description" 
                      value={seoData.ogDescription || ''} 
                      isGood={!!seoData.ogDescription}
                    />
                    <DataField 
                      label="og:image" 
                      value={seoData.ogImage || ''} 
                      isGood={!!seoData.ogImage}
                    />
                    <DataField 
                      label="og:type" 
                      value={seoData.ogType || ''} 
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Technical SEO */}
              <Card className="border border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm">Technical Analysis</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {seoScore.breakdown.technical}/30
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DataField 
                      label="canonical" 
                      value={seoData.canonical || ''} 
                      isGood={!!seoData.canonical}
                    />
                    <DataField 
                      label="lang" 
                      value={seoData.lang || ''} 
                      isGood={!!seoData.lang}
                    />
                    <DataField 
                      label="viewport" 
                      value={seoData.viewport || ''} 
                      isGood={!!seoData.viewport}
                    />
                    <DataField 
                      label="charset" 
                      value={seoData.charset || ''} 
                      isGood={!!seoData.charset}
                    />
                    <DataField 
                      label="robots" 
                      value={seoData.metaRobots || 'index,follow'} 
                    />
                    <DataField 
                      label="url" 
                      value={seoData.url} 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Twitter Cards */}
              {(seoData.twitterCard || seoData.twitterTitle || seoData.twitterDescription) && (
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">Twitter Cards</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DataField 
                        label="twitter:card" 
                        value={seoData.twitterCard || ''} 
                      />
                      <DataField 
                        label="twitter:title" 
                        value={seoData.twitterTitle || ''} 
                      />
                      <DataField 
                        label="twitter:description" 
                        value={seoData.twitterDescription || ''} 
                      />
                      <DataField 
                        label="twitter:image" 
                        value={seoData.twitterImage || ''} 
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preview Section */}
              <Card className="border border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm">Social & Search Previews</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Google Search Preview */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-muted-foreground mb-3 flex items-center gap-2">
                      <Search className="h-3 w-3" />
                      GOOGLE SEARCH RESULT
                    </div>
                    <div className="bg-white p-4 rounded border border-border/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-600">{new URL(seoData.url).hostname}</span>
                        </div>
                        <div className="text-blue-600 text-xl hover:underline cursor-pointer line-clamp-1">
                          {seoData.title || 'No title found'}
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {seoData.description || 'No meta description available'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Facebook/Open Graph Preview */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-muted-foreground mb-3 flex items-center gap-2">
                      <Share2 className="h-3 w-3" />
                      FACEBOOK / OPEN GRAPH
                    </div>
                    <div className="bg-white rounded border border-border/50 overflow-hidden">
                      {seoData.ogImage && (
                        <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                          <img 
                            src={seoData.ogImage} 
                            alt="OG Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-sm">Image unavailable</div>';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-3 bg-gray-50">
                        <div className="text-xs text-gray-500 uppercase mb-1">
                          {new URL(seoData.url).hostname}
                        </div>
                        <div className="text-gray-900 font-semibold text-base line-clamp-1">
                          {seoData.ogTitle || seoData.title || 'No title'}
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {seoData.ogDescription || seoData.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Twitter Card Preview */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="text-[#1DA1F2]">𝕏</span>
                      TWITTER / X CARD
                    </div>
                    <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
                      {(seoData.twitterImage || seoData.ogImage) && (
                        <div className="w-full h-56 bg-gray-200 relative overflow-hidden">
                          <img 
                            src={seoData.twitterImage || seoData.ogImage} 
                            alt="Twitter Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-sm">Image unavailable</div>';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600 line-clamp-1">
                          {new URL(seoData.url).hostname}
                        </div>
                        <div className="text-gray-900 font-semibold text-base line-clamp-1 mt-1">
                          {seoData.twitterTitle || seoData.ogTitle || seoData.title || 'No title'}
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {seoData.twitterDescription || seoData.ogDescription || seoData.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LinkedIn Preview */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="text-[#0A66C2]">in</span>
                      LINKEDIN
                    </div>
                    <div className="bg-white rounded border border-border/50 overflow-hidden">
                      {seoData.ogImage && (
                        <div className="w-full h-52 bg-gray-200 relative overflow-hidden">
                          <img 
                            src={seoData.ogImage} 
                            alt="LinkedIn Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-sm">Image unavailable</div>';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-3 bg-white">
                        <div className="text-gray-900 font-semibold text-sm line-clamp-2">
                          {seoData.ogTitle || seoData.title || 'No title'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new URL(seoData.url).hostname}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEOTester;