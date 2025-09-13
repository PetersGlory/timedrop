'use client';

import React,{ useState, useEffect, useCallback } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
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

const TRADE_AMOUNTS = [5000, 10000, 50000, 100000];


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

export default function MarketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // All hooks at the top level
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradeAmount, setTradeAmount] = useState(0);
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string>('');
  const { token } = useAuth();
  const router = useRouter();

  const side = searchParams.get('side') === 'no' ? 'no' : 'yes';
  const defaultTab = side === 'no' ? 'no' : 'yes';

  // Only fetch market, do not set loading for profile fetch
  async function fetchMarket() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketById(params?.id);
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

  useEffect(() => {
    fetchMarket();
    // Profile info is not critical for market display, so don't block loading on it
    getProfileInfo();
    // eslint-disable-next-line
  }, []);


  function ShareButton() {
    const referralLink =
      typeof window !== 'undefined'
        ? `${window.location.origin}/login?ref=${referralCode}`
        : `/login?ref=${referralCode}`;

    const handleShare = useCallback(async () => {
      if (typeof window !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: "Join me on Timedrop!",
            text: "Check out this market and sign up with my referral link.",
            url: referralLink,
          });
          toast({
            title: "Shared!",
            description: "Your referral link was shared successfully.",
          });
        } catch (err) {
          // If user cancels or error, fallback to clipboard
          navigator.clipboard.writeText(referralLink);
          toast({
            title: "Link Copied!",
            description: "The referral link has been copied to your clipboard.",
          });
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(referralLink);
        toast({
          title: "Link Copied!",
          description: "The referral link has been copied to your clipboard.",
        });
      }
    }, [referralLink]);

    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleShare}
        className="flex items-center justify-center"
      >
        <Share2 className="h-4 w-4" />
        <span className="sr-only">Refer a Friend</span>
      </Button>
    );
  }

  // Do NOT set loading for profile info, so market loading is not affected
  const getProfileInfo = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const profile = await getProfile(token as string);
      setReferralCode(profile?.timedropId);
    } catch (err) {
      console.log(err);
    }
  };

  // Only show loading spinner if market is loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <svg
          className="animate-spin h-8 w-8 text-primary mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-lg font-medium text-muted-foreground">
          Loading market details. Please wait...
        </span>
      </div>
    );
  }

  // If market is not found, show error
  if (!loading && market === null) {
    if (error) {
      console.error('Market loading error:', error);
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <svg
          className="h-10 w-10 text-destructive mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm1 5h-2v6h2V7zm0 8h-2v2h2v-2z"
          />
        </svg>
        <span className="text-lg font-semibold text-destructive mb-2">
          Market Not Found
        </span>
        <span className="text-muted-foreground mb-4">
          The market you are looking for does not exist or is unavailable.
        </span>
        <button
          type='button'
          onClick={()=> router.back()}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        >
          Browse Markets
        </button>
      </div>
    );
  }

  // If market is still loading or not available, do not render the rest of the page
  if (!market) {
    return null;
  }

  const isMarketClosed = isPast(new Date(market?.endDate));

  const chartConfig = {
    chance: {
      label: 'Chance',
      color: 'hsl(var(--primary))',
    },
  };

  const handleOrderPlacement = async (side: 'Yes' | 'No') => {
    if (market.status !== 'Open') {
      toast({
        variant: 'destructive',
        title: 'Order Error',
        description: `Order is ${market?.status || 'closed'}.`,
      });
      return;
    }
    if (tradeAmount === 0) {
      toast({
        variant: 'destructive',
        title: 'Order Error',
        description: 'Please select an amount to trade.',
      });
      return;
    }

    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to place an order.',
      });
      return;
    }

    setLoading(true);
    try {
      await placeOrder(
        {
          marketId: market.id,
          type: side.toUpperCase() === 'YES' ? 'BUY' : 'SELL', // 'YES' or 'NO'
          quantity: tradeAmount,
          price: tradeAmount,
        },
        token
      );
      toast({
        title: 'Order Placed',
        description: `${side} order for ${tradeAmount.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })} of "${market.question}" has been submitted.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: err.message || 'Failed to place order. Please try again.',
      });
      if(err.message == "Insufficient wallet balance"){
        setTimeout(()=>{
          router.replace("/account")
        },1000)
      }
    } finally {
      setLoading(false);
    }
  };

  const estimatedCost = tradeAmount;
  const maxProfit = tradeAmount;

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
                      onClick={()=> router.back()}
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
                  <ShareButton />
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
  const calculateContracts = (anyVal:any) =>{
    return anyVal / 1000;
  }
  return (
    <div className="pt-4 space-y-4">
      <div className="space-y-2">
        <Label>Trade Contract</Label>
        <div className="flex flex-wrap gap-2">
          {TRADE_AMOUNTS.map((amount) => {
            // Calculate number of contracts (assuming 1 contract = 1000)
            const contracts = amount / 1000;
            return (
              <Button
                key={`trade-${amount}`}
                variant={tradeAmount === amount ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTradeAmount(amount)}
                className="flex-grow min-w-[40%] sm:min-w-[120px] max-w-[48%] pt-1 sm:max-w-[160px] text-xs sm:text-sm flex flex-col items-center"
              >
                <span>{amount.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400 hover:text-gray-200 mt-[-10%]">
                  - {contracts} contract{contracts > 1 ? 's' : ''}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Your Contract:</span>
          <span className="font-medium">{estimatedCost.toFixed(2) +"/"+calculateContracts(estimatedCost) +"C"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Profit:</span>
          <span className="font-medium text-green-600">
            {maxProfit.toFixed(2) + "/" + calculateContracts(maxProfit) + "C"}
          </span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-foreground">Minimum Payout:</span>
          <span className="text-foreground">
            {(estimatedCost + maxProfit).toFixed(2) + "/" + calculateContracts((estimatedCost + maxProfit)) + "C"}
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