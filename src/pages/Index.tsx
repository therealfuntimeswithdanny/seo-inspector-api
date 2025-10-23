import SEOTester from '@/components/SEOTester';
import { HelmetProvider } from 'react-helmet-async';
import { SEOMetaTags } from '@/components/SEOMetaTags';

const Index = () => {
  return (
    <HelmetProvider>
      <SEOMetaTags 
        title="SEO Tester - Analyze & Optimize Your Website Meta Tags"
        description="Free SEO analysis tool to check meta tags, Open Graph, Twitter Cards, and technical SEO. Improve your website's search engine visibility instantly."
      />
      <SEOTester />
    </HelmetProvider>
  );
};

export default Index;