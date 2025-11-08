'use client';

import { useState, useEffect } from 'react';
import { getMarkets } from './account/api';
import { MarketCard } from '@/components/market-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Market } from '@/lib/definitions';
import { isPast, isAfter } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Info, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const orderedCategories = [
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
  'Misc',
];

// Note: Metadata is handled in the root layout for client components

// Helper function to check if market is closed based on endDate and time
const isMarketClosed = (endDate: string): boolean => {
  const now = new Date();
  const marketEndDate = new Date(endDate);
  
  // Use isPast for more precise comparison that includes time
  return isPast(marketEndDate);
  
  // Alternative approach - more explicit comparison:
  // return now >= marketEndDate;
};

// Helper function to check if market is still active
const isMarketActive = (market: Market): boolean => {
  return !isMarketClosed(market.endDate) && market?.status === "Open" && market?.isDaily === 0;
};

export default function MarketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 items per page (4 rows x 3 columns on large screens)

  useEffect(() => {
    async function fetchMarkets() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMarkets();
        setMarkets(data.markets || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load markets');
      } finally {
        setLoading(false);
      }
    }
    fetchMarkets();
  }, []);

  // Filter markets using the improved helper function
  const activeMarkets = markets.filter(isMarketActive);
  
  const dailyMarkets = markets.filter(
    (market) => market?.isDaily === true && market?.status === "Open" && !isMarketClosed(market.endDate) || market?.isDaily === 1 && market?.status === "Open" && !isMarketClosed(market.endDate)
  );
  
  const closedMarkets = markets.filter((market) => 
    isMarketClosed(market.endDate) || market?.status !== "Open"
  );

  const filteredActiveMarkets = activeMarkets.filter((market) =>
    market.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableCategories = ['All', ...orderedCategories];

  const getMarketsByCategory = (category: string): Market[] => {
    if (category === 'All') {
      return filteredActiveMarkets;
    }
    return filteredActiveMarkets.filter((market) => market.category === category);
  };
  
  const marketsForCurrentTab = getMarketsByCategory(activeTab);

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(marketsForCurrentTab.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMarkets = marketsForCurrentTab.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of markets section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Debug logging (remove in production)
  useEffect(() => {
    if (markets.length > 0) {
      console.log('Sample market endDate check:');
      markets.slice(0, 2).forEach(market => {
        const endDate = new Date(market.endDate);
        const now = new Date();
        console.log({
          question: market.question,
          endDate: market.endDate,
          parsedEndDate: endDate,
          currentTime: now,
          isPastResult: isPast(endDate),
          isMarketClosedResult: isMarketClosed(market.endDate)
        });
      });
    }
  }, [markets]);

  return (
    <div className="container mx-auto">
      <header className="mb-8">
        <p className="text-muted-foreground">
          Browse and predict on a variety of future events.
        </p>
        <div className="flex items-center gap-2 mt-4 max-w-lg">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search live markets..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Info className="mr-2 h-4 w-4" />
                Guide
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Guide</DialogTitle>
                <DialogDescription>
                  A simple guide to get you started.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    You are going against other players for very specific singular outcomes.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Pick a market</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse the available markets and choose one you want to predict the outcome for.
                  </p>
                </div>
                 <div className="space-y-2">
                  <h3 className="font-semibold">2. Buy &apos;Yes&apos; or &apos;No&apos; shares</h3>
                  <p className="text-sm text-muted-foreground">
                    Depending on your prediction, you can buy shares for either &apos;Yes&apos; or &apos;No&apos;. Your price reflects the market&apos;s current belief.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading markets...</div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">{error}</div>
      ) : (
      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={setActiveTab}
      >
        {dailyMarkets.length > 0 && (
          <div className="mb-12 mt-4">
            <h2 className="text-base font-bold tracking-tight mb-8">
              Daily Markets
            </h2>
            <div className="overflow-x-auto">
              <div className="flex gap-6 pb-2" style={{ minWidth: 0 }}>
                {dailyMarkets.map((market) => (
                  <div
                    key={market.id}
                    className="min-w-[280px] max-w-xs flex-shrink-0 w-full md:min-w-[320px] md:max-w-sm"
                  >
                    <MarketCard market={market} />
                  </div>
                ))}
              </div>
            </div>
            <Separator className="my-8" />
          </div>
        )}

        <TabsContent value={activeTab} className="mt-6">
          {/* Pagination Controls */}
          {marketsForCurrentTab.length > 0 && totalPages > 1 && (
            <div className="flex flex-col items-center justify-center gap-4 mt-8 mb-4">
              <div className="flex items-center gap-2">
                {/* Previous button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const pages: (number | string)[] = [];
                    const showEllipsis = totalPages > 7;
                    
                    if (!showEllipsis) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);
                      
                      if (currentPage <= 4) {
                        // Near the start: show 1, 2, 3, 4, 5, ..., last
                        for (let i = 2; i <= 5; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 3) {
                        // Near the end: show 1, ..., last-4, last-3, last-2, last-1, last
                        pages.push('...');
                        for (let i = totalPages - 4; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // In the middle: show 1, ..., current-1, current, current+1, ..., last
                        pages.push('...');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="text-muted-foreground px-1">
                            ...
                          </span>
                        );
                      }
                      const pageNum = page as number;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    });
                  })()}
                </div>
                
                {/* Next button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {/* Page info */}
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, marketsForCurrentTab.length)} of {marketsForCurrentTab.length} markets
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
          {marketsForCurrentTab.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No markets found.
            </div>
          )}
          
          {/* Pagination Controls */}
          {marketsForCurrentTab.length > 0 && totalPages > 1 && (
            <div className="flex flex-col items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2">
                {/* Previous button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const pages: (number | string)[] = [];
                    const showEllipsis = totalPages > 7;
                    
                    if (!showEllipsis) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);
                      
                      if (currentPage <= 4) {
                        // Near the start: show 1, 2, 3, 4, 5, ..., last
                        for (let i = 2; i <= 5; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 3) {
                        // Near the end: show 1, ..., last-4, last-3, last-2, last-1, last
                        pages.push('...');
                        for (let i = totalPages - 4; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // In the middle: show 1, ..., current-1, current, current+1, ..., last
                        pages.push('...');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="text-muted-foreground px-1">
                            ...
                          </span>
                        );
                      }
                      const pageNum = page as number;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    });
                  })()}
                </div>
                
                {/* Next button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {/* Page info */}
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, marketsForCurrentTab.length)} of {marketsForCurrentTab.length} markets
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      )}

      {closedMarkets.length > 0 && searchTerm === '' && !loading && !error && (
        <div className="mt-12">
          <Separator className="my-8" />
          <h2 className="text-base font-bold tracking-tight mb-8">
            Closed Markets
          </h2>
          <div className="grid grid-cols-1 gap-6 opacity-75 md:grid-cols-2 lg:grid-cols-3">
            {closedMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}