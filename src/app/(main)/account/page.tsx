
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import Link from 'next/link';

export default function WalletPage() {
  const { token } = useAuth();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | string | null>(null);
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
  const [bankSearch, setBankSearch] = useState('');
  const [isBankPopoverOpen, setIsBankPopoverOpen] = useState(false);

  const filteredBanks = useMemo(() => {
    const query = bankSearch.trim().toLowerCase();
    if (!query) return banks;
    return banks.filter((bank) =>
      (bank.name || '').toLowerCase().includes(query) || (bank.code || '').toLowerCase().includes(query)
    );
  }, [banks, bankSearch]);

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
      if (data && data.wallet && data.wallet.balance != null) {
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
    if (!token) {
      setBanks([]);
      return;
    }
    
    try {
      const banksList = await getBanks(token);
      // Some APIs return {data: {data: [...]}} and some {data: [...]}, so handle both
      const banksArray =
        Array.isArray(banksList?.data?.data)
          ? banksList.data.data
          : Array.isArray(banksList?.data)
            ? banksList.data
            : Array.isArray(banksList)
              ? banksList
              : [];
      setBanks(banksArray);
    } catch (err: any) {
      setBanks([]);
      console.error('Failed to fetch banks:', err);
      // Only show error if it's not a network/auth issue
      if (err.message && !err.message.includes('401') && !err.message.includes('fetch')) {
        toast({
          title: 'Warning',
          description: 'Could not load banks list. You can still proceed with withdrawal.',
          variant: 'default',
        });
      }
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
        console.log(response)
        if (response.status === 'successful' || response.status === 'completed' || response.status === 'success') {
          // Call backend to confirm and credit wallet
          try {
            if (!token) throw new Error('Not authenticated');
            const dataJson = {
              amount: (numericAmount - updatedAmount),
              narration: 'Wallet deposit via Flutterwave',
              currency: 'NGN',
              reference: response.transaction_id,
              payment_method: "flutterwave_deposits",
              tx_ref: response.tx_ref,
              status: response.status,
            }
            await depositFunds(dataJson, token);
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
    const numericAmount = parseFloat(amount);
    
    // Validate amount first
    if (isNaN(numericAmount) || numericAmount < 1000) {
      toast({
        title: 'Invalid Amount',
        description: 'Minimum withdrawal amount is ₦1,000.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check sufficient balance
    if (balance !== null && numericAmount > Number(balance)) {
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough funds in your wallet to withdraw this amount.',
        variant: 'destructive',
      });
      return;
    }
    
    // Reset modal state and open
    setWithdrawError(null);
    setShowWithdrawModal(true);
    setWithdrawAccountNumber('');
    setWithdrawBankCode('');
    setAccountName(null);
  };

  // Validate account number when both bank and account number are present
  const validate = async () => {
    setAccountName(null);
    setWithdrawError(null);
    
    if (
      withdrawAccountNumber.trim().length >= 10 &&
      withdrawBankCode &&
      withdrawAccountNumber.trim().length <= 12 && // allow for 10-12 digit accounts
      token
    ) {
      setIsValidatingAccount(true);
      try {
        const result = await validateAccount({
          account_number: withdrawAccountNumber.trim(),
          account_bank: withdrawBankCode,
        }, token);
        
        // Handle different response formats
        const accountName = result?.account_name || result?.data?.account_name || result?.data?.data?.account_name;
        
        if (accountName) {
          setAccountName(accountName);
          setWithdrawError(null);
        } else {
          setAccountName(null);
          setWithdrawError('Account validation failed. Please check your account details.');
        }
      } catch (err: any) {
        setAccountName(null);
        setWithdrawError(
          (err?.response?.data?.message && typeof err.response.data.message === 'string')
            ? err.response.data.message
            : err.message || 'Failed to validate account. Please check your account details and try again.'
        );
      } finally {
        setIsValidatingAccount(false);
      }
    } else {
      setAccountName(null);
    }
  };


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
    // Calculate the transaction fee: 7.5% of 1% of the amount
    const transactionFee = numericAmount * 0.01 * 0.075;
    setIsLoading(true);
    try {
      if (!token) throw new Error('Not authenticated');
      // Pass account number and bank code to the backend
      await withdrawFunds(
        {
          account_bank: withdrawBankCode,
          account_number: withdrawAccountNumber.trim(),
          amount: numericAmount,
          transaction_fee: transactionFee,
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
      let errorMessage = 'Failed to process withdrawal.';
      
      // Extract error message from various possible error structures
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.errorbody?.message) {
        errorMessage = err.response.data.errorbody.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setWithdrawError(errorMessage);
      toast({
        title: 'Withdrawal Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      {showWithdrawModal && (
        <>
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
              <Popover open={isBankPopoverOpen} onOpenChange={(open) => {
                setIsBankPopoverOpen(open);
                if (open) setBankSearch('');
              }}>
                <PopoverTrigger asChild>
                  <button
                    id="withdraw-bank-name"
                    type="button"
                    className="w-full border rounded px-3 py-2 bg-background text-foreground text-left flex items-center justify-between"
                    disabled={isLoading || banks.length === 0}
                  >
                    <span className="truncate">
                      {withdrawBankCode
                        ? (banks.find(b => b.code === withdrawBankCode)?.name || 'Select Bank')
                        : (banks.length === 0 ? 'Loading banks...' : 'Select Bank')}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 opacity-70">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      placeholder="Search bank by name or code"
                      autoFocus
                      autoComplete="off"
                    />
                    <div className="max-h-56 overflow-auto border rounded">
                      {banks.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Loading banks...</div>
                      ) : filteredBanks.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No banks match your search</div>
                      ) : (
                        <ul className="divide-y">
                          {filteredBanks.map((bank) => (
                            <li key={bank.code}>
                              <button
                                type="button"
                                className={`w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground ${withdrawBankCode === bank.code ? 'bg-accent/50' : ''}`}
                                onClick={() => {
                                  setWithdrawBankCode(bank.code);
                                  setIsBankPopoverOpen(false);
                                  if (accountName) setAccountName(null);
                                  if (withdrawError) setWithdrawError(null);
                                }}
                              >
                                <span className="block text-sm">{bank.name}</span>
                                {/* <span className="block text-xs text-muted-foreground">{bank.code}</span> */}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="withdraw-account-number">Account Number</Label>
              <input
                id="withdraw-account-number"
                type="number"
                value={withdrawAccountNumber}
                onChange={e => setWithdrawAccountNumber(e.target.value)}
               onBlur={validate}
                disabled={isLoading}
                maxLength={12}
                minLength={10}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                autoComplete="off"
                placeholder="Enter your 10-digit account number"
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
              <div className="text-green-700 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded border">
                ✓ Account Name: <span className="font-semibold">{accountName}</span>
              </div>
            )}
            {withdrawError && (
              <div className="text-destructive text-sm bg-destructive/10 p-2 rounded border border-destructive/20">
                ⚠ {withdrawError}
              </div>
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
        </>
      )}
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
                    ? `₦${typeof balance === 'number' ? balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : Number(balance).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                    : <span className="text-destructive">₦0.00</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Your available trading balance.
              </p>
            </CardContent>
            <CardFooter>
              <Button>
                <Link href="/transactions">
                  View Transactions
                </Link>
              </Button>
            </CardFooter>
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
                {/* {amount && !isNaN(Number(amount)) && Number(amount) > 0 ? (
                  <span>
                    Payment processing fee (2.0%): ₦{(Number(amount) * 0.02).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.<br />
                    7.5% VAT on fee: ₦{(Number(amount) * 0.02 * 0.075).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.<br />
                    <strong>
                      You will receive: ₦{(Number(amount) - (Number(amount) * 0.02 * 0.075)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </span>
                ) : (
                )} */}
                <>Note: VAT fee is attached.</>
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
              {/* <div className="text-xs text-muted-foreground pt-2">
                Payments are securely processed by Flutterwave.
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
