import { MetadataRoute } from 'next';
import { getMarkets } from './(main)/account/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://timedrop.live';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/account`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/transactions`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/predict`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/referral`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // Dynamic market pages
  let marketPages: MetadataRoute.Sitemap = [];
  
  try {
    const marketsData = await getMarkets();
    const markets = marketsData?.markets || [];
    
    marketPages = markets.map((market: any) => ({
      url: `${baseUrl}/markets/${market.id}`,
      lastModified: new Date(market.updatedAt || market.createdAt || new Date()),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching markets for sitemap:', error);
    // Fallback to empty array if API fails
    marketPages = [];
  }

  // Category pages (if you have category-specific routes)
  const categoryPages = [
    'News',
    'Climate', 
    'Economics',
    'Social',
    'Companies',
    'Sports',
    'Finance',
    'Crypto',
    'Technology',
    'Science',
    'Health',
    'Misc'
  ].map(category => ({
    url: `${baseUrl}/?category=${category.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...marketPages, ...categoryPages];
}
