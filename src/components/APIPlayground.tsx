import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Play, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export const APIPlayground = () => {
  const [testUrl, setTestUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-seo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ url: testUrl })
      });
      
      const data = await res.json();
      setResponse(data);
      
      if (data.success) {
        toast.success('Analysis completed!');
      } else {
        toast.error(data.error || 'Analysis failed');
      }
    } catch (error) {
      toast.error('Failed to call API');
      setResponse({ error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Try it out</h3>
        <div className="flex gap-2">
          <Input
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter URL to analyze"
            className="flex-1"
          />
          <Button 
            onClick={handleTest} 
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Card>

      {response && (
        <Card className="p-6 bg-muted border-border">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-foreground">Response</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyResponse}
              className="text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <pre className="text-xs overflow-auto max-h-96 bg-background p-4 rounded border border-border text-foreground">
            {JSON.stringify(response, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};