
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart } from 'recharts';
import type { Market } from '@/lib/definitions';
import { ArrowUpRight, Bookmark } from 'lucide-react';
import { CountdownTimer } from './countdown-timer';
import { useToast } from '@/hooks/use-toast';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { cn } from '@/lib/utils';
import { generateMarketHistory } from '@/lib/data';

export function MarketCard({ market }: { market: Market }) {
  const chartConfig = {
    chance: {
      label: 'Chance',
      color: 'hsl(var(--primary))',
    },
  };
  const { toast } = useToast();
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();
  const isBookmarked = bookmarks.some((b) => b.id === market.id);

  const handleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(market.id);
      toast({
        title: 'Bookmark Removed',
        description: `"${market.question}" has been removed from your bookmarks.`,
      });
    } else {
      addBookmark(market);
      toast({
        title: 'Bookmark Added',
        description: `"${market.question}" has been added to your bookmarks.`,
      });
    }
  };


  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-4 flex-grow space-y-2">
        <div className="flex gap-4">
           <div className="relative h-24 w-24 flex-shrink-0">
            <Image
              src={market.image.url}
              alt={market.question}
              fill
              className="object-cover rounded-md"
              data-ai-hint={market.image.hint}
            />
          </div>
          <div className="flex flex-col">
            <Badge variant="secondary" className="mb-2 self-start">{market.category}</Badge>
            <CardTitle className="text-lg font-semibold leading-snug">
              <Link onClick={()=>{
                localStorage.setItem("marketId", market.id)
                localStorage.setItem("markeName", market.question)
              }} href={`/markets/${market.id}`} className="hover:text-primary transition-colors">
                {market.question}
              </Link>
            </CardTitle>
          </div>
        </div>
        {market.status !== "closed" && (
          <CountdownTimer endDate={market.endDate} />
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-4 pt-0">
        <div className="w-full h-20 -mb-4">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              accessibilityLayer
              data={generateMarketHistory(market.startDate, market.endDate,50)}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`fill-${market.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chance)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-chance)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="chance"
                type="natural"
                fill={`url(#fill-${market.id})`}
                stroke="var(--color-chance)"
                stackId="a"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel hideIndicator formatter={(value) => `${value}%`} />}
              />
            </AreaChart>
          </ChartContainer>
        </div>
        {market.status !== "closed" ? (
          <div className="flex justify-between w-full items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={handleBookmark}
            >
              <Bookmark className={cn('h-5 w-5', isBookmarked && 'fill-primary text-primary')} />
              <span className="sr-only">Bookmark</span>
            </Button>
            <div className="flex gap-2">
              <Button asChild size="sm">
                  <Link href={`/markets/${market.id}?side=yes`}>BUY YES</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                  <Link href={`/markets/${market.id}?side=no`}>BUY NO</Link>
              </Button>
            </div>
          </div>
        ): (
          <div className="flex flex-row items-center w-full justify-between px-4 py-2">
            <p className='font-bold text-gray-700'>Outcome:</p>
            <p className='font-bold text-primary'>{market.outcome}</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
