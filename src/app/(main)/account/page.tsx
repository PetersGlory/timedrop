
'use client';

import { useState, useEffect } from 'react';
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
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import {
  getWalletBalance,
  depositFunds,
  withdrawFunds,
  getProfile,
  getBanks,
  validateAccount,
} from './api';

export default function WalletPage() {
  const { token } = useAuth();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<any>();
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Withdrawal modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState('');
  const [withdrawBankCode, setWithdrawBankCode] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [isValidatingAccount, setIsValidatingAccount] = useState(false);
  const [accountName, setAccountName] = useState<string | null>(null);

  // Fetch wallet balance on mount and after deposit/withdraw
  const fetchBalance = async () => {
    if (!token) {
      setBalance(null);
      setLoadingBalance(false);
      return;
    }
    setLoadingBalance(true);
    try {
      const data = await getWalletBalance(token);
      // The backend now returns { wallet: { ... } }
      if (data && data.wallet && typeof data.wallet.balance === 'number') {
        setBalance(data.wallet.balance);
      } else {
        setBalance(null);
      }
    } catch (err: any) {
      setBalance(null);
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch wallet balance.',
        variant: 'destructive',
      });
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchProfile = async () => {
    if (!token) {
      setUserProfile(null);
      return;
    }
    try {
      // getProfile is imported from ./api
      const profile = await getProfile(token);
      setUserProfile(profile);
    } catch (err: any) {
      setUserProfile(null);
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch user profile.',
        variant: 'destructive',
      });
    }
  };

    const fetchBanks = async () => {
      try {
        const banksList = await getBanks(token as string);
        setBanks(banksList || []);
      } catch (err: any) {
        setBanks([]);
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch banks list.',
          variant: 'destructive',
        });
      }
    };


  useEffect(() => {
    fetchBalance();
    fetchProfile();
    fetchBanks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const FLUTTERWAVE_PUBLIC_KEY = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || PUBLIC_FLUTTERWAVE_PUBLIC_KEY;

  const config = {
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `Timedrop-${Date.now()}`,
    amount: pendingAmount || 1000,
    currency: 'NGN',
    payment_options: 'card,banktransfer,ussd',
    customer: {
      email: userProfile?.email || '',
      phone_number: userProfile?.phone || '',
      name: userProfile?.firstName || '',
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
    setPendingAmount(parseFloat(amount));
    const updatedAmount = numericAmount * 0.02 * 0.075;
    setIsLoading(true);
    handleFlutterwavePayment({
      callback: async (response: any) => {
        if (response.status === 'successful') {
          // Call backend to confirm and credit wallet
          try {
            if (!token) throw new Error('Not authenticated');
            await depositFunds((numericAmount - updatedAmount), token);
            toast({
              title: 'Deposit Successful',
              description: `₦${numericAmount.toLocaleString()} has been added to your wallet.`,
            });
            setAmount('');
          } catch (err: any) {
            toast({
              title: 'Deposit Error',
              description: err.message || 'Failed to credit your wallet. Please contact support if your payment was successful.',
              variant: 'destructive',
            });
          }finally{
            fetchBalance();
            fetchProfile();
          }
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

  // Open modal to collect withdrawal details
  const handleWithdraw = () => {
    setWithdrawError(null);
    setShowWithdrawModal(true);
    setWithdrawAccountNumber('');
    setWithdrawBankCode('');
    setAccountName(null);
  };

  // Validate account number when both bank and account number are present
  useEffect(() => {
    const validate = async () => {
      setAccountName(null);
      setWithdrawError(null);
      if (
        withdrawAccountNumber.trim().length >= 10 &&
        withdrawBankCode &&
        withdrawAccountNumber.trim().length <= 12 // allow for 10-12 digit accounts
      ) {
        setIsValidatingAccount(true);
        try {
          const result = await validateAccount({
            account_number: withdrawAccountNumber.trim(),
            account_bank: withdrawBankCode,
          }, token as string);
          if (result && result.account_name) {
            setAccountName(result.account_name);
            setWithdrawError(null);
          } else {
            setAccountName(null);
            setWithdrawError('Account validation failed. Please check details.');
          }
        } catch (err: any) {
          setAccountName(null);
          setWithdrawError(
            err.message || 'Failed to validate account. Please check details.'
          );
        } finally {
          setIsValidatingAccount(false);
        }
      } else {
        setAccountName(null);
      }
    };

    // Only validate if both fields are filled
    if (
      withdrawAccountNumber.trim().length >= 10 &&
      withdrawBankCode
    ) {
      validate();
    } else {
      setAccountName(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawAccountNumber, withdrawBankCode]);

  // Actual withdrawal after collecting account info
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 1000) {
      setWithdrawError('Minimum withdrawal amount is ₦1,000.');
      return;
    }
    if (!withdrawAccountNumber.trim() || !withdrawBankCode) {
      setWithdrawError('Please provide both account number and bank.');
      return;
    }
    if (!accountName) {
      setWithdrawError('Please validate your account details before withdrawing.');
      return;
    }
    setIsLoading(true);
    try {
      if (!token) throw new Error('Not authenticated');
      // Pass account number and bank code to the backend
      await withdrawFunds(
        {
          account_bank: withdrawBankCode,
          account_number: withdrawAccountNumber.trim(),
          amount: numericAmount,
          narration: 'Wallet withdrawal',
          currency: 'NGN',
          reference: undefined,
          callback_url: undefined,
          debit_currency: 'NGN',
        },
        token
      );
      toast({
        title: 'Withdrawal Processed',
        description: `₦${numericAmount.toLocaleString()} has been withdrawn from your wallet.`,
        variant: 'default',
      });
      setAmount('');
      setWithdrawAccountNumber('');
      setWithdrawBankCode('');
      setAccountName(null);
      setShowWithdrawModal(false);
      fetchBalance();
    } catch (err: any) {
      setWithdrawError(err.message || 'Failed to process withdrawal.');
      toast({
        title: 'Withdrawal Error',
        description: err.message || 'Failed to process withdrawal.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Modal component for withdrawal details
  const WithdrawModal = () => {
    if (!showWithdrawModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white dark:bg-background rounded-lg shadow-lg p-6 w-full max-w-md relative">
          <button
            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
            onClick={() => {
              setShowWithdrawModal(false);
              setWithdrawError(null);
              setWithdrawAccountNumber('');
              setWithdrawBankCode('');
              setAccountName(null);
            }}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
          <h2 className="text-lg font-semibold mb-4">Withdrawal Details</h2>
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div>
              <Label htmlFor="withdraw-bank-name">Bank</Label>
              <select
                id="withdraw-bank-name"
                value={withdrawBankCode}
                onChange={e => setWithdrawBankCode(e.target.value)}
                disabled={isLoading || banks.length === 0}
                className="w-full border rounded px-3 py-2 bg-background"
                required
              >
                <option value="">Select Bank</option>
                {banks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="withdraw-account-number">Account Number</Label>
              <Input
                id="withdraw-account-number"
                type="text"
                value={withdrawAccountNumber}
                onChange={e => {
                  // Only allow numbers
                  const val = e.target.value.replace(/\D/g, '');
                  setWithdrawAccountNumber(val);
                }}
                disabled={isLoading}
                maxLength={12}
                minLength={10}
                autoComplete="off"
                required
              />
            </div>
            {isValidatingAccount && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 mr-1 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Validating account...
              </div>
            )}
            {accountName && (
              <div className="text-green-700 text-sm">
                Account Name: <span className="font-semibold">{accountName}</span>
              </div>
            )}
            {withdrawError && (
              <div className="text-destructive text-sm">{withdrawError}</div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawError(null);
                  setWithdrawAccountNumber('');
                  setWithdrawBankCode('');
                  setAccountName(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isValidatingAccount || !accountName}>
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Confirm Withdrawal"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <WithdrawModal />
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
              <div className="text-2xl font-bold">
                {loadingBalance ? (
                  <span className="animate-pulse text-muted-foreground">Loading...</span>
                ) : (
                  balance !== null
                    ? `₦${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : <span className="text-destructive">₦0</span>
                )}
              </div>
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
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setPendingAmount(e.target.valueAsNumber)
                    }}
                    min="0"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {amount && !isNaN(Number(amount)) && Number(amount) > 0 ? (
                  <span>
                    Payment processing fee (2.0%): ₦{(Number(amount) * 0.02).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.<br />
                    7.5% VAT on fee: ₦{(Number(amount) * 0.02 * 0.075).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.<br />
                    <strong>
                      You will receive: ₦{(Number(amount) - (Number(amount) * 0.02 * 0.075)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </span>
                ) : (
                  <>Please note: 7.5% of the 2.0% payment processing fee will be deducted from your deposit amount.</>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button className="w-full" onClick={handleDeposit} disabled={isLoading || loadingBalance}>
                  Deposit
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleWithdraw}
                  disabled={isLoading || loadingBalance}
                >
                  {isLoading && showWithdrawModal ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Withdrawing...
                    </span>
                  ) : (
                    "Withdraw"
                  )}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground pt-2">
                Payments are securely processed by Flutterwave.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
