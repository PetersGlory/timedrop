'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
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
import { toast } from '@/hooks/use-toast';
import { CountdownTimer } from '@/components/countdown-timer';
import { ArrowLeft, Share2 } from 'lucide-react';
import { isPast } from 'date-fns';
import { getMarketById, getProfile, placeOrder } from '../../account/api';
import { useAuth } from '@/context/AuthContext';
import { generateMarketHistory } from '@/lib/data';

const TRADE_AMOUNTS = [1000, 5000, 10000, 50000, 100000];

// Chart configuration
const chartConfig = {
  chance: {
    label: 'Chance',
    color: 'hsl(var(--primary))',
  },
};

function ShareButtonFull(referralCode: any) {
  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/login?ref=${referralCode}`
      : `/login?ref=${referralCode}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join this market!',
          text: 'Check out this market and join using my referral link:',
          url: referralLink,
        });
        toast({
          title: 'Link Shared!',
          description: 'The market link has been shared using your device options.',
        });
      } catch (error) {
        // If user cancels or share fails, fallback to clipboard
        navigator.clipboard.writeText(referralLink);
        toast({
          title: 'Link Copied!',
          description: 'The market link has been copied to your clipboard.',
        });
      }
    } else {
      // Fallback for browsers that do not support Web Share API
      navigator.clipboard.writeText(referralLink);
      toast({
        title: 'Link Copied!',
        description: 'The market link has been copied to your clipboard.',
      });
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center"
      size="icon"
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4 mr-2" />
      <span className="inline xs:hidden">Share personalized market link</span>
      <span className="inline md:hidden">Share</span>
    </Button>
  );
}

function TradeForm({
  side,
  tradeAmount,
  setTradeAmount,
  estimatedCost,
  maxProfit,
  onOrderPlacement,
  referralCode,
}: {
  side: 'Yes' | 'No';
  tradeAmount: number;
  setTradeAmount: (amount: number) => void;
  estimatedCost: number;
  maxProfit: number;
  onOrderPlacement: () => void;
  referralCode: string;
}) {
  const calculateContracts = (anyVal: any) => {
    return anyVal / 1000;
  };

  // Local input for user custom amount
  const [customAmount, setCustomAmount] = useState(tradeAmount > 0 ? tradeAmount : '');

  // Keep customAmount in sync with prop, but don't override if user is typing
  React.useEffect(() => {
    // Only update if tradeAmount matches one of the quick-pick, or user hasn't entered a custom amount
    if (tradeAmount !== Number(customAmount) && customAmount === '') {
      setCustomAmount(tradeAmount > 0 ? tradeAmount : '');
    }
  }, [tradeAmount]);

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Validate integer input or empty
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    if (val !== '') {
      setTradeAmount(Number(val));
    }
  };

  return (
    <div className="pt-4 space-y-4">
      <div className="space-y-2">
        <Label>Trade Share</Label>
        {/* User input section */}
        <div className="flex gap-2 items-center mb-2">
          <input
            type="number"
            min={1}
            step={100}
            className="block flex-1 rounded-md border border-muted px-3 py-2 w-40 text-sm focus:outline-none focus:border-primary"
            placeholder="Enter amount"
            value={customAmount}
            onChange={handleCustomAmountChange}
            onBlur={() => {
              // If input is empty or 0 setTradeAmount(0)
              if (customAmount === '' || Number(customAmount) <= 0) {
                setTradeAmount(0);
              }
            }}
            aria-label="Enter custom trade amount"
          />
          <span className="text-xs text-muted-foreground">₦</span>
        </div>
        {/* Quick pick buttons */}
        <div className="flex flex-wrap gap-2">
          {TRADE_AMOUNTS.map((amount) => {
            // Calculate number of contracts (assuming 1 contract = 1000)
            const contracts = amount / 1000;
            return (
              <Button
                key={`trade-${amount}`}
                variant={tradeAmount === amount ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setTradeAmount(amount);
                  setCustomAmount(String(amount));
                }}
                className={`pt-1 text-xs sm:text-sm flex flex-col items-center ${
                  amount === 100000
                    ? "w-full" // full width if 100000
                    : "flex-grow min-w-[40%] sm:min-w-[120px] max-w-[48%] sm:max-w-[160px]"
                }`}
              >
                <span>{amount.toLocaleString()}</span>
                <span className={`text-[10px] text-gray-400 hover:text-gray-200 ${amount !== 100000 ? "mt-[-10%]" : "mt-[-5%]"}`}>
                  {contracts} Share{contracts > 1 ? "s" : ""}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Your Shares:</span>
          <span className="font-medium">{tradeAmount.toFixed(2) + "/" + calculateContracts(tradeAmount) + "C"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Profit:</span>
          <span className="font-medium text-green-600">
            {(tradeAmount *2).toFixed(2) + "/" + calculateContracts((tradeAmount *2)) + "C"}
          </span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-foreground">Minimum Payout:</span>
          <span className="text-foreground">
            {((tradeAmount *2)).toFixed(2) + "/" + calculateContracts(((tradeAmount *2))) + "C"}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <Button className="w-full" onClick={onOrderPlacement}>
          BUY {side.toUpperCase()}
        </Button>
        <ShareButtonFull referralCode={referralCode} />
      </div>
    </div>
  );
}

export default function MarketDetailClient({ 
  marketId,
  initialMarket
}: {
  marketId: string;
  initialMarket?: any;
}) {
  const [market, setMarket] = useState<any>(initialMarket || null);
  const [loading, setLoading] = useState(!initialMarket);
  const [error, setError] = useState<string | null>(null);
  const [tradeAmount, setTradeAmount] = useState(0);
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string>('');
  const { token } = useAuth();
  const router = useRouter();

  const side = searchParams.get('side') === 'no' ? 'no' : 'yes';
  const defaultTab = side === 'no' ? 'no' : 'yes';

  // Calculate trading values
  const currentPrice = market?.history && market.history.length > 0 
    ? market.history[market.history.length - 1].chance 
    : 50;
  
  const estimatedCost = tradeAmount * (currentPrice / 100);
  const maxProfit = tradeAmount;

  // Fetch market data
  async function fetchMarket() {
    if (initialMarket) return; // Don't refetch if we have initial data
    
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketById(marketId);
      if (!data || !data.market) {
        setError('Market not found');
        setMarket(null);
      } else {
        setMarket(data.market);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load market');
      setMarket(null);
    } finally {
      setLoading(false);
    }
  }

  // Fetch user profile for referral code
  async function getProfileInfo() {
    if (!token) return;
    try {
      const profile = await getProfile(token);
      if (profile?.timedropId) {
        setReferralCode(profile.timedropId);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }

  useEffect(() => {
    fetchMarket();
    getProfileInfo();
  }, [marketId, token]);

  const handleOrderPlacement = useCallback(async (side: 'Yes' | 'No') => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (tradeAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid trade amount.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const orderData = {
        marketId: market.id,
        type: side.toUpperCase() === 'YES' ? 'BUY' : 'SELL', // 'YES' or 'NO'
        quantity: tradeAmount,
        price: tradeAmount,
      };

      await placeOrder(orderData, token);
      toast({
        title: 'Order Placed',
        description: `Successfully placed ${side} order for ₦${tradeAmount.toLocaleString()}`,
      });
      
      setTimeout(()=>{
        router.replace("/portfolio")
      },1000)
    } catch (err: any) {
      toast({
        title: 'Order Failed',
        description: err.message || 'Failed to place order',
        variant: 'destructive',
      });
      if(err.message == "Insufficient wallet balance"){
        setTimeout(()=>{
          router.replace("/account")
        },1000)
      }
    } finally {
      setLoading(false);
    }
  }, [token, tradeAmount, marketId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading market...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Market Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested market could not be found.</p>
          <Button onClick={() => router.push('/')}>
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  const isMarketClosed = isPast(new Date(market.endDate));

  return (
    <div className="container mx-auto px-2 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type='button'
                      onClick={() => router.back()}
                      className="inline-flex items-center px-2 py-1 text-sm rounded hover:bg-muted transition"
                      aria-label="Back to Markets"
                    >
                      <ArrowLeft />
                    </button>
                    <CardTitle className="text-2xl sm:text-3xl font-bold break-words">
                      {market.question}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground flex-wrap">
                    <CountdownTimer endDate={market?.endDate} />
                  </div>
                  {/* Show category if available */}
                  {market.category && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Category: {market.category}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 mt-2 sm:mt-0">
                  <ShareButtonFull referralCode={referralCode} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Show image if available */}
              {market.image && market.image.url && (
                <div className="mb-6">
                  <div className="flex justify-center items-center w-full h-48 sm:h-64 mb-4">
                    <img
                      src={market.image.url}
                      alt={market.image.hint || 'Market image'}
                      className="max-h-full max-w-full object-contain rounded-md border w-full"
                      style={{ maxHeight: '16rem' }}
                    />
                  </div>
                </div>
              )}
              <div className="w-full" style={{ minHeight: '250px' }}>
                <div className="h-60 sm:h-96 w-full">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart
                      accessibilityLayer
                      data={generateMarketHistory(
                        market?.startDate,
                        market?.endDate,
                        50
                      )}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      width={undefined}
                      height={undefined}
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
                        content={
                          <ChartTooltipContent
                            formatter={(value) => `${value}%`}
                          />
                        }
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
              </div>
            </CardContent>
          </Card>

          <Card className='hidden md:flex flex-col'>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                This is a market where you can predict the outcome of a future event. Your response reflects your current belief.
              </p>
              <p>
                You are going against other traders for very specific singular outcomes.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Select an amount you want to trade.
                </li>
                <li>
                  When an opposing order from another trader matches, a trade occurs.
                </li>
                <li>
                  If you are correct, you get your trade back plus your profit.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Place Order */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 z-10 w-full max-w-full">
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
                    <TabsTrigger
                      value="yes"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Yes
                    </TabsTrigger>
                    <TabsTrigger
                      value="no"
                      className="data-[state=active]:bg-pink-600 data-[state=active]:text-white"
                    >
                      No
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="yes">
                    <TradeForm
                      side="Yes"
                      tradeAmount={tradeAmount}
                      setTradeAmount={setTradeAmount}
                      estimatedCost={estimatedCost}
                      maxProfit={maxProfit}
                      onOrderPlacement={() => handleOrderPlacement('Yes')}
                      referralCode={referralCode}
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
                      referralCode={referralCode}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
        <Card className='flex flex-col md:hidden'>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              This is a market where you can predict the outcome of a future event. Your response reflects your current belief.
            </p>
            <p>
              You are going against other traders for very specific singular outcomes.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Select an amount you want to trade.
              </li>
              <li>
                When an opposing order from another trader matches, a trade occurs.
              </li>
              <li>
                If you are correct, you get your trade back plus your profit.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
