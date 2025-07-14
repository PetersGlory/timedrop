
'use client';

import { useState } from 'react';
import { markets } from '@/lib/data';
import { MarketCard } from '@/components/market-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Market } from '@/lib/definitions';
import { isPast } from 'date-fns';
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
import { Info, Search } from 'lucide-react';

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

export default function MarketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const activeMarkets = markets.filter(
    (market) => !isPast(new Date(market.endDate))
  );
  const closedMarkets = markets.filter((market) =>
    isPast(new Date(market.endDate))
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
                How it works
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>How it works</DialogTitle>
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

      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={setActiveTab}
      >
        <div className="overflow-x-auto pb-2">
          <TabsList>
            {availableCategories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {marketsForCurrentTab.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
          {marketsForCurrentTab.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No markets found.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {closedMarkets.length > 0 && searchTerm === '' && (
        <div className="mt-12">
          <Separator className="my-8" />
          <h2 className="text-3xl font-bold tracking-tight mb-8">
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
