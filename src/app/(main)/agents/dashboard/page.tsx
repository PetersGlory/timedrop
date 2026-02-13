'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import {
  Copy,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { getAgent, getAgentReferralCode } from '../../account/api';

interface ReferralStats {
  totalReferrals: number;
  totalReferralVolume: number;
  recentReferrals: Array<{
    id: string;
    userId: string;
    marketId: string;
    orderAmount: number;
    createdAt: string;
  }>;
}

export default function AgentDashboard() {
  const router = useRouter();
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(()=>{
    const handleLoad = async () =>{
      const referral = localStorage.getItem("referralCode");
      if(referral){
        await fetchReferralStats(JSON.parse(referral));
        setReferralCode(JSON.parse(referral))
      }
    }

    handleLoad();
  },[])

  const fetchReferralStats = async (code: string) => {
    if (!code) {
      toast({
        title: 'Missing Code',
        description: 'Please enter your referral code.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await getAgent(code);
      
      setStats(response.agent);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load referral statistics',
        variant: 'destructive',
      });
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast({
        title: 'Copied!',
        description: 'Referral code copied to clipboard.',
      });
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Please copy the code manually.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Agent Dashboard</h1>
        <p className="text-muted-foreground">
          Track your referral performance and earnings
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enter Your Referral Code</CardTitle>
          <CardDescription>
            View statistics for your agent referral code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter your referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="font-mono"
                maxLength={20}
              />
            </div>
            <Button
              onClick={() => fetchReferralStats(referralCode)}
              disabled={loading || !referralCode}
            >
              {loading ? 'Loading...' : 'View Stats'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {searched && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Referrals
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReferrals}</div>
                <p className="text-xs text-muted-foreground">
                  People using your code
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Volume
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦{stats.totalReferralVolume.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total trade volume
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Your Code
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold font-mono">
                    {referralCode}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this code
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Referrals Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
              <CardDescription>
                Latest trades using your referral code
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentReferrals && stats.recentReferrals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No referrals yet. Share your code to get started!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Market ID</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentReferrals?.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(referral.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {referral.marketId.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {referral.userId.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₦{referral.orderAmount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Share Your Code</CardTitle>
              <CardDescription>
                Get more referrals by sharing your code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Referral Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}?ref=${referralCode}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const link = `${window.location.origin}?ref=${referralCode}`;
                      try {
                        await navigator.clipboard.writeText(link);
                        toast({
                          title: 'Copied!',
                          description: 'Referral link copied to clipboard.',
                        });
                      } catch (err) {
                        toast({
                          title: 'Copy Failed',
                          description: 'Please copy the link manually.',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Users who sign up or make trades using this link will be
                automatically tracked to your referral code.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* No Results */}
      {searched && !stats && !loading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p>No data found for this referral code.</p>
              <p className="text-sm mt-2">
                Make sure you've entered the correct code.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}