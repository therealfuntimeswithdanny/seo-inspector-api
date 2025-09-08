import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Search, ExternalLink, Image, FileText, Tag, Globe, AlertCircle, CheckCircle, Zap, TrendingUp, Eye, Share2, Target } from 'lucide-react';

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
      // Simulate progress updates
      setProgress(20);
      
      // First, let's try to validate the URL format
      const urlObj = new URL(url);
      setProgress(40);
      
      // For demonstration, we'll use a CORS proxy service
      // In a real app, you'd want to use a backend service
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
      
      // Trigger results animation
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

  const ScoreIndicator = ({ hasValue, label }: { hasValue: boolean; label: string }) => (
    <div className="flex items-center gap-2 group cursor-default">
      <div className="relative">
        {hasValue ? (
          <CheckCircle className="h-4 w-4 text-success group-hover:scale-110 transition-transform duration-200" />
        ) : (
          <AlertCircle className="h-4 w-4 text-destructive group-hover:scale-110 transition-transform duration-200" />
        )}
      </div>
      <span className="text-sm group-hover:text-foreground transition-colors duration-200">{label}</span>
    </div>
  );

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

  return (
    <div className="min-h-screen bg-gradient-subtle relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full animate-pulse-glow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-glow/5 rounded-full animate-pulse-glow" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-primary rounded-xl shadow-elegant">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">SEO Analyzer</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get comprehensive SEO insights with our advanced analyzer. 
              Discover optimization opportunities and track your website's performance.
            </p>
          </div>

          {/* URL Input Form */}
          <Card className="mb-8 shadow-card animate-scale-in border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="text-lg pr-12 border-2 focus:border-primary transition-all duration-300"
                      required
                    />
                    <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isLoading}
                    className="bg-gradient-primary hover:shadow-elegant transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                    {isLoading ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-bounce-subtle" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Analyze SEO
                      </>
                    )}
                  </Button>
                </div>
                
                {isLoading && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Analyzing website...</span>
                      <span className="text-primary font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="mb-8 border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {seoData && seoScore && (
            <div className={`space-y-6 ${showResults ? 'animate-fade-in-up' : 'opacity-0'}`}>
              {/* SEO Score Dashboard */}
              <Card className="shadow-card border-0 bg-gradient-primary text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-primary opacity-90"></div>
                <CardContent className="pt-6 relative z-10">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-3 mb-4">
                      <TrendingUp className="h-8 w-8" />
                      <h2 className="text-2xl font-bold">SEO Score</h2>
                    </div>
                    <div className="relative inline-flex items-center justify-center">
                      <div className="text-6xl font-bold mb-2">
                        <AnimatedCounter value={seoScore.total} />
                      </div>
                      <div className="absolute -top-2 -right-8 text-lg font-medium bg-white/20 px-2 py-1 rounded-full">
                        {getScoreGrade(seoScore.total)}
                      </div>
                    </div>
                    <p className="text-white/80 mb-6">out of 100 points</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold mb-1">
                        <AnimatedCounter value={seoScore.breakdown.basic} />
                      </div>
                      <div className="text-sm text-white/80">Basic SEO</div>
                      <div className="text-xs text-white/60">/ 40 pts</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold mb-1">
                        <AnimatedCounter value={seoScore.breakdown.social} />
                      </div>
                      <div className="text-sm text-white/80">Social Media</div>
                      <div className="text-xs text-white/60">/ 30 pts</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold mb-1">
                        <AnimatedCounter value={seoScore.breakdown.technical} />
                      </div>
                      <div className="text-sm text-white/80">Technical</div>
                      <div className="text-xs text-white/60">/ 30 pts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Overview */}
              <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Quick Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ScoreIndicator hasValue={!!seoData.title} label="Page Title" />
                    <ScoreIndicator hasValue={!!seoData.description} label="Meta Description" />
                    <ScoreIndicator hasValue={!!seoData.ogImage} label="OG Image" />
                    <ScoreIndicator hasValue={!!seoData.canonical} label="Canonical URL" />
                    <ScoreIndicator hasValue={!!seoData.h1} label="H1 Tag" />
                    <ScoreIndicator hasValue={!!seoData.lang} label="Language" />
                    <ScoreIndicator hasValue={!!seoData.viewport} label="Viewport" />
                    <ScoreIndicator hasValue={!!seoData.charset} label="Charset" />
                  </div>
                </CardContent>
              </Card>

              {/* Basic SEO */}
              <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Basic SEO
                    <Badge variant="secondary" className="ml-auto">
                      {seoScore.breakdown.basic}/40 pts
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="group hover:bg-muted/30 p-3 rounded-lg transition-colors duration-200">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      Page Title
                      {seoData.title && (
                        <Badge variant={seoData.title.length >= 30 && seoData.title.length <= 60 ? 'default' : 'secondary'} className="text-xs">
                          {seoData.title.length} chars
                        </Badge>
                      )}
                    </label>
                    <p className="mt-2 text-foreground font-medium">{seoData.title || 'Not found'}</p>
                    {seoData.title && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {seoData.title.length < 30 && <span className="text-yellow-600">⚠️ Too short (recommended: 30-60 characters)</span>}
                        {seoData.title.length > 60 && <span className="text-yellow-600">⚠️ Too long (recommended: 30-60 characters)</span>}
                        {seoData.title.length >= 30 && seoData.title.length <= 60 && <span className="text-green-600">✓ Good length</span>}
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Meta Description</label>
                    <p className="mt-1 text-foreground">{seoData.description || 'Not found'}</p>
                    {seoData.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Length: {seoData.description.length} characters
                      </p>
                    )}
                  </div>

                  {seoData.keywords && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Keywords</label>
                        <p className="mt-1 text-foreground">{seoData.keywords}</p>
                      </div>
                    </>
                  )}

                  {seoData.canonical && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Canonical URL</label>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-foreground break-all">{seoData.canonical}</p>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={seoData.canonical} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Open Graph */}
              <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    Open Graph (Facebook)
                    <Badge variant="secondary" className="ml-auto">
                      {seoScore.breakdown.social}/30 pts
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {seoData.ogImage && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">OG Image</label>
                      <div className="mt-2">
                        <img 
                          src={seoData.ogImage} 
                          alt="OG Preview" 
                          className="max-w-sm h-auto border rounded-md shadow-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1 break-all">{seoData.ogImage}</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">OG Title</label>
                    <p className="mt-1 text-foreground">{seoData.ogTitle || 'Not found'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">OG Description</label>
                    <p className="mt-1 text-foreground">{seoData.ogDescription || 'Not found'}</p>
                  </div>

                  {seoData.ogType && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">OG Type</label>
                      <Badge variant="secondary" className="mt-1">{seoData.ogType}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Twitter Cards */}
              <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    Twitter Cards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {seoData.twitterCard && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Card Type</label>
                      <Badge variant="secondary" className="mt-1">{seoData.twitterCard}</Badge>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Twitter Title</label>
                    <p className="mt-1 text-foreground">{seoData.twitterTitle || 'Not found'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Twitter Description</label>
                    <p className="mt-1 text-foreground">{seoData.twitterDescription || 'Not found'}</p>
                  </div>

                  {seoData.twitterImage && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Twitter Image</label>
                      <div className="mt-2">
                        <img 
                          src={seoData.twitterImage} 
                          alt="Twitter Preview" 
                          className="max-w-sm h-auto border rounded-md shadow-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1 break-all">{seoData.twitterImage}</p>
                      </div>
                    </div>
                  )}
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