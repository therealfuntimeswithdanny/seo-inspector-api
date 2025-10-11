import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Code, Terminal, Book, ChevronRight, Copy, Check, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Docs = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const apiUrl = 'https://gjhfnqiknusundbktwxs.supabase.co/functions/v1/analyze-seo';

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255,255,255) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground mb-4">
              <Home className="h-4 w-4" />
              Back to SEO Tester
            </Link>
            
            <div className="flex items-center gap-3 mb-4 p-4 bg-muted/50 rounded-lg border border-border/50">
              <Terminal className="h-5 w-5 text-primary" />
              <div className="flex items-center gap-1 text-xs font-mono">
                <span className="text-primary">$</span>
                <span className="text-muted-foreground">api-documentation</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground font-mono flex items-center gap-2">
              <Book className="h-8 w-8 text-primary" />
              SEO Analyzer API
            </h1>
            <p className="text-sm text-muted-foreground font-mono mt-2">
              → RESTful API for programmatic SEO analysis
            </p>
          </div>

          {/* Quick Start */}
          <Card className="mb-6 border border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm">Quick Start</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs">GET STARTED</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">ENDPOINT</span>
                </div>
                <div className="bg-muted/30 p-3 rounded font-mono text-sm border border-border/50 flex items-center justify-between">
                  <code className="text-primary break-all">{apiUrl}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(apiUrl, 'endpoint')}
                    className="ml-2"
                  >
                    {copiedSection === 'endpoint' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="bg-green-600 text-xs">POST</Badge>
                  <span className="text-xs font-mono text-muted-foreground">METHOD</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Format */}
          <Card className="mb-6 border border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">Request Format</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs font-mono text-muted-foreground mb-2">HEADERS</div>
                <div className="bg-muted/30 p-3 rounded font-mono text-sm border border-border/50">
                  <div className="text-muted-foreground">Content-Type: <span className="text-foreground">application/json</span></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">REQUEST BODY</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('{\n  "url": "https://example.com"\n}', 'request')}
                  >
                    {copiedSection === 'request' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <pre className="bg-muted/30 p-4 rounded font-mono text-sm border border-border/50 overflow-x-auto">
{`{
  "url": "https://example.com"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Response Format */}
          <Card className="mb-6 border border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">Response Format</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">SUCCESS RESPONSE (200)</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(`{
  "success": true,
  "data": {
    "title": "Page Title",
    "description": "Meta description",
    "ogTitle": "OG Title",
    "ogDescription": "OG Description",
    "ogImage": "https://example.com/image.jpg",
    "ogType": "website",
    "twitterCard": "summary_large_image",
    "h1": "Main Heading",
    "canonical": "https://example.com",
    "lang": "en",
    "viewport": "width=device-width, initial-scale=1",
    "charset": "UTF-8",
    "metaRobots": "index,follow"
  },
  "score": {
    "total": 85,
    "breakdown": {
      "basic": 35,
      "social": 30,
      "technical": 20
    }
  }
}`, 'response')}
                >
                  {copiedSection === 'response' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-muted/30 p-4 rounded font-mono text-xs border border-border/50 overflow-x-auto max-h-96">
{`{
  "success": true,
  "data": {
    "title": "Page Title",
    "description": "Meta description",
    "ogTitle": "OG Title",
    "ogDescription": "OG Description",
    "ogImage": "https://example.com/image.jpg",
    "ogType": "website",
    "twitterCard": "summary_large_image",
    "twitterTitle": "Twitter Title",
    "twitterDescription": "Twitter Description",
    "twitterImage": "https://example.com/image.jpg",
    "h1": "Main Heading",
    "canonical": "https://example.com",
    "keywords": "keyword1, keyword2",
    "lang": "en",
    "viewport": "width=device-width, initial-scale=1",
    "charset": "UTF-8",
    "metaRobots": "index,follow",
    "url": "https://example.com"
  },
  "score": {
    "total": 85,
    "breakdown": {
      "basic": 35,
      "social": 30,
      "technical": 20
    }
  }
}`}
              </pre>
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card className="mb-6 border border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">Code Examples</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* JavaScript/Fetch */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">JAVASCRIPT (FETCH)</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(`fetch('${apiUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`, 'js-fetch')}
                  >
                    {copiedSection === 'js-fetch' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <pre className="bg-muted/30 p-4 rounded font-mono text-xs border border-border/50 overflow-x-auto">
{`fetch('${apiUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`}
                </pre>
              </div>

              <Separator />

              {/* cURL */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">CURL</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(`curl -X POST '${apiUrl}' \\
  -H 'Content-Type: application/json' \\
  -d '{"url": "https://example.com"}'`, 'curl')}
                  >
                    {copiedSection === 'curl' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <pre className="bg-muted/30 p-4 rounded font-mono text-xs border border-border/50 overflow-x-auto">
{`curl -X POST '${apiUrl}' \\
  -H 'Content-Type: application/json' \\
  -d '{"url": "https://example.com"}'`}
                </pre>
              </div>

              <Separator />

              {/* Python */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">PYTHON</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(`import requests

url = "${apiUrl}"
payload = {"url": "https://example.com"}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`, 'python')}
                  >
                    {copiedSection === 'python' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <pre className="bg-muted/30 p-4 rounded font-mono text-xs border border-border/50 overflow-x-auto">
{`import requests

url = "${apiUrl}"
payload = {"url": "https://example.com"}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Error Responses */}
          <Card className="border border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-destructive" />
                <span className="font-mono text-sm">Error Responses</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant="destructive" className="text-xs mb-2">400 BAD REQUEST</Badge>
                <pre className="bg-muted/30 p-3 rounded font-mono text-xs border border-border/50">
{`{
  "error": "URL parameter is required"
}`}
                </pre>
              </div>

              <div>
                <Badge variant="destructive" className="text-xs mb-2">500 INTERNAL ERROR</Badge>
                <pre className="bg-muted/30 p-3 rounded font-mono text-xs border border-border/50">
{`{
  "success": false,
  "error": "Failed to fetch website"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Docs;
