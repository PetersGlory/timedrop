
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
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { PUBLIC_FLUTTERWAVE_PUBLIC_KEY } from '@/lib/definitions';

export default function WalletPage() {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);

  // Replace with actual user data if available
  const user = {
    email: '', // e.g., from auth context
    phoneNumber: '',
    firstName: '',
  };

  const FLUTTERWAVE_PUBLIC_KEY = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || PUBLIC_FLUTTERWAVE_PUBLIC_KEY;

  const config = {
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `Timedrop-${Date.now()}`,
    amount: pendingAmount || 1000,
    currency: 'NGN',
    payment_options: 'card,banktransfer,ussd',
    customer: {
      email: user?.email || '',
      phone_number: user?.phoneNumber || '',
      name: user?.firstName || '',
    },
    customizations: {
      title: 'Add Funds to Wallet',
      description: 'Top up your Timedrop wallet',
      logo: '/logo.png',
    },
  };

  const handleFlutterwavePayment = useFlutterwave(config);

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
    setPendingAmount(numericAmount);
    setIsLoading(true);
    handleFlutterwavePayment({
      callback: async (response: any) => {
        if (response.status === 'successful') {
          // TODO: Call backend to confirm and credit wallet
          toast({
            title: 'Deposit Successful',
            description: `₦${numericAmount.toLocaleString()} has been added to your wallet.`,
          });
          setAmount('');
        } else {
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment or it was not successful.',
            variant: 'destructive',
          });
        }
        setIsLoading(false);
        closePaymentModal();
      },
      onClose: () => {
        setIsLoading(false);
      },
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
              Add or remove funds from your wallet to trade. Minimum amount is ₦1,000.
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
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button className="w-full" onClick={handleDeposit} disabled={isLoading}>
                Deposit with Flutterwave
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleWithdraw}
                disabled={isLoading}
              >
                Withdraw
              </Button>
            </div>
            <div className="text-xs text-muted-foreground pt-2">
              Payments are securely processed by Flutterwave.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
