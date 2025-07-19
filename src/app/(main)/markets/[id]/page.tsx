
'use client';

import { useState } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { getMarketById } from '@/lib/data';
import { toast } from '@/hooks/use-toast';
import { CountdownTimer } from '@/components/countdown-timer';
import { Share2 } from 'lucide-react';
import { isPast } from 'date-fns';
import { Separator } from '@/components/ui/separator';

const TRADE_AMOUNTS = [1000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];

function ShareButton() {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href.split('?')[0]);
    toast({
      title: 'Link Copied!',
      description: 'The market link has been copied to your clipboard.',
    });
  };
  return (
    <Button variant="outline" size="icon" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
      <span className="sr-only">Share Market</span>
    </Button>
  );
}

function ShareButtonFull() {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href.split('?')[0]);
    toast({
      title: 'Link Copied!',
      description: 'The market link has been copied to your clipboard.',
    });
  };
  return (
    <Button variant="outline" className="w-full" onClick={handleShare}>
      <Share2 className="h-4 w-4 mr-2" />
      Share Market
    </Button>
  );
}


export default function MarketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const market = getMarketById(params.id);
  const searchParams = useSearchParams();
  const side = searchParams.get('no') === 'true' ? 'no' : 'yes';
  
  const defaultTab = side === 'no' ? 'no' : 'yes';

  if (!market) {
    notFound();
  }

  const isMarketClosed = isPast(new Date(market.endDate));

  const [tradeAmount, setTradeAmount] = useState(0);

  const chartConfig = {
    chance: {
      label: 'Chance',
      color: 'hsl(var(--primary))',
    },
  };

  const handleOrderPlacement = (side: 'Yes' | 'No') => {
    if (tradeAmount === 0) {
      toast({
        variant: 'destructive',
        title: 'Order Error',
        description: 'Please select an amount to trade.',
      });
      return;
    }
    toast({
      title: 'Order Placed',
      description: `${side} order for ${tradeAmount.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })} of "${
        market.question
      }" has been submitted.`,
    });
  };

  const estimatedCost = tradeAmount;
  const maxProfit = tradeAmount;

  return (
    <div className="container mx-auto">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {market.question}
                  </CardTitle>
                  <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                    <CountdownTimer endDate={market.endDate} />
                  </div>
                </div>
                <ShareButton />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <AreaChart
                    accessibilityLayer
                    data={market.history}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value, index) => {
                        // Show every 4th hour label to prevent clutter
                        if (index % 4 === 0) {
                          return value;
                        }
                        return '';
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent formatter={(value) => `${value}%`} />}
                    />
                    <defs>
                      <linearGradient
                        id="fillChance"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-chance)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-chance)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="chance"
                      type="natural"
                      fill="url(#fillChance)"
                      stroke="var(--color-chance)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                This is a market where you can predict the outcome of a future event. Your response reflects your current belief.
              </p>
              <p>
                You are going against other players for very specific singular outcomes.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Select an amount you want to trade.
                </li>
                <li>
                  When an opposing order from another user matches, a trade occurs.
                </li>
                <li>
                  If you are correct, you get your trade back plus your profit.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Place Order</CardTitle>
            </CardHeader>
            <CardContent>
              {isMarketClosed ? (
                <div className="flex items-center justify-center text-center py-10 text-muted-foreground">
                  Trading is closed for this market.
                </div>
              ) : (
                <Tabs defaultValue={defaultTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="yes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Yes</TabsTrigger>
                    <TabsTrigger value="no" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white">No</TabsTrigger>
                  </TabsList>
                  <TabsContent value="yes">
                    <TradeForm
                      side="Yes"
                      tradeAmount={tradeAmount}
                      setTradeAmount={setTradeAmount}
                      estimatedCost={estimatedCost}
                      maxProfit={maxProfit}
                      onOrderPlacement={() => handleOrderPlacement('Yes')}
                    />
                  </TabsContent>
                  <TabsContent value="no">
                    <TradeForm
                      side="No"
                      tradeAmount={tradeAmount}
                      setTradeAmount={setTradeAmount}
                      estimatedCost={estimatedCost}
                      maxProfit={maxProfit}
                      onOrderPlacement={() => handleOrderPlacement('No')}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TradeForm({
  side,
  tradeAmount,
  setTradeAmount,
  estimatedCost,
  maxProfit,
  onOrderPlacement,
}: {
  side: 'Yes' | 'No';
  tradeAmount: number;
  setTradeAmount: (amount: number) => void;
  estimatedCost: number;
  maxProfit: number;
  onOrderPlacement: () => void;
}) {
  return (
    <div className="pt-4 space-y-4">
      <div className="space-y-2">
        <Label>Amount to Trade</Label>
        <div className="flex flex-wrap gap-2">
          {TRADE_AMOUNTS.map((amount) => (
            <Button
              key={`trade-${amount}`}
              variant={
                tradeAmount === amount ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => setTradeAmount(amount)}
              className="flex-grow"
            >
              {amount.toLocaleString()}
            </Button>
          ))}
        </div>
      </div>
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Your Trade:
          </span>
          <span className="font-medium">
            {estimatedCost.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Profit:</span>
          <span className="font-medium text-green-600">
            {maxProfit.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-foreground">
            Potential Payout:
          </span>
          <span className="text-foreground">
            {(estimatedCost + maxProfit).toFixed(2)}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <Button
          className="w-full"
          onClick={onOrderPlacement}
        >
          BUY {side.toUpperCase()}
        </Button>
        <ShareButtonFull />
      </div>
    </div>
  );
}
