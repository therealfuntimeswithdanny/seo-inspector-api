import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Search, ExternalLink, Image, FileText, Tag, Globe, AlertCircle, CheckCircle } from 'lucide-react';

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
}

const SEOTester = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      url
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
      // First, let's try to validate the URL format
      const urlObj = new URL(url);
      
      // For demonstration, we'll use a CORS proxy service
      // In a real app, you'd want to use a backend service
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('No content received from the website');
      }

      const extractedData = extractMetaData(data.contents, url);
      setSeoData(extractedData);
      
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeSEO();
  };

  const getScoreColor = (hasValue: boolean) => {
    return hasValue ? 'success' : 'destructive';
  };

  const ScoreIndicator = ({ hasValue, label }: { hasValue: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {hasValue ? (
        <CheckCircle className="h-4 w-4 text-success" />
      ) : (
        <AlertCircle className="h-4 w-4 text-destructive" />
      )}
      <span className="text-sm">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">SEO Analyzer</h1>
            <p className="text-lg text-muted-foreground">
              Analyze any website's SEO metadata and social media tags
            </p>
          </div>

          {/* URL Input Form */}
          <Card className="mb-8 shadow-card">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-lg"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isLoading}
                  className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                </Button>
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
          {seoData && (
            <div className="space-y-6">
              {/* SEO Score Overview */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    SEO Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ScoreIndicator hasValue={!!seoData.title} label="Page Title" />
                    <ScoreIndicator hasValue={!!seoData.description} label="Meta Description" />
                    <ScoreIndicator hasValue={!!seoData.ogImage} label="OG Image" />
                    <ScoreIndicator hasValue={!!seoData.canonical} label="Canonical URL" />
                  </div>
                </CardContent>
              </Card>

              {/* Basic SEO */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Basic SEO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Page Title</label>
                    <p className="mt-1 text-foreground">{seoData.title || 'Not found'}</p>
                    {seoData.title && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Length: {seoData.title.length} characters
                      </p>
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
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Open Graph (Facebook)
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
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
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