
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';

export default function WalletPage() {
  const [amount, setAmount] = useState('');

  const handleDeposit = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 1000) {
      toast({
        title: 'Invalid Amount',
        description: 'Minimum deposit amount is ₦1,000.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Deposit Successful',
      description: `₦${numericAmount.toLocaleString()} has been added to your wallet.`,
    });
  };

  const handleWithdraw = () => {
     const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 1000) {
      toast({
        title: 'Invalid Amount',
        description: 'Minimum withdrawal amount is ₦1,000.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Withdrawal Processed',
      description: `₦${numericAmount.toLocaleString()} has been withdrawn from your wallet.`,
      variant: 'default',
    });
  };

  return (
    <div className="container mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground mt-2">
          Manage your wallet balance and view your performance.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦1,250.75</div>
            <p className="text-xs text-muted-foreground">
              Your available trading balance.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deposit &amp; Withdraw Funds</CardTitle>
            <CardDescription>
              Add or remove funds from your wallet to trade.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  ₦
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000.00"
                  className="pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button className="w-full" onClick={handleDeposit}>
                Deposit
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleWithdraw}
              >
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
