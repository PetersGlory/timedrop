import type { Metadata } from 'next';
import { getMarketById } from '../../account/api';
import MarketDetailClient from './MarketDetailClient';

// Generate metadata for individual market pages
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const market = await getMarketById(id);
    
    if (!market) {
      return {
        title: 'Market Not Found',
        description: 'The requested prediction market could not be found.',
      };
    }

    console.log(market.market)

    const marketTitle = `${market?.market?.question} | Prediction Market`;
    const marketDescription = `Predict the outcome: ${market?.market?.question}. Trade Yes/No shares on this ${market?.market?.category.toLowerCase()} prediction market. Market closes ${new Date(market.market.endDate).toLocaleDateString()}.`;

    return {
      title: marketTitle,
      description: marketDescription,
      keywords: [
        'prediction market',
        market?.market?.category.toLowerCase(),
        'forecasting',
        'future events',
        'trading predictions',
        market?.market?.question.toLowerCase(),
      ],
      openGraph: {
        title: marketTitle,
        description: marketDescription,
        images: [
          {
            url: market?.market?.image?.url || '/og-market-image.png',
            width: 1200,
            height: 630,
            alt: market?.market?.question,
          },
        ],
        type: 'article',
        publishedTime: market?.market?.startDate,
        modifiedTime: new Date().toISOString(),
        section: market?.market?.category,
        tags: [market?.market?.category, 'prediction', 'forecasting'],
      },
      twitter: {
        card: 'summary_large_image',
        title: marketTitle,
        description: marketDescription,
        images: [market.image?.url || '/twitter-market-image.png'],
      },
      alternates: {
        canonical: `/markets/${id}`,
      },
    };
  } catch (error) {
    return {
      title: 'Market Error',
      description: 'There was an error loading the prediction market.',
    };
  }
}

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params before using them
  const { id } = await params;
  
  // Try to fetch market data on the server for better SEO
  let initialMarket = null;
  try {
    const marketData = await getMarketById(id);
    initialMarket = marketData?.market || null;
  } catch (error) {
    // If server fetch fails, client will handle it
    console.error('Failed to fetch market on server:', error);
  }

  return <MarketDetailClient marketId={id} initialMarket={initialMarket} />;
}