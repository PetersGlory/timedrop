'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Copy, CheckCircle2, UserPlus, Landmark } from 'lucide-react';
import { getAgentLogin, registerAgent } from '../../account/api';

export default function AgentRegistration() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  // Bank detail fields
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');

  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  // Validate that if any bank field is filled, all three must be filled
  const validateBankDetails = (): string | null => {
    const filledFields = [accountNumber, accountName, bankName].filter(Boolean);
    if (filledFields.length > 0 && filledFields.length < 3) {
      const missing: string[] = [];
      if (!accountNumber) missing.push('Account Number');
      if (!accountName) missing.push('Account Name');
      if (!bankName) missing.push('Bank Name');
      return `Please fill in: ${missing.join(', ')}`;
    }
    if (accountNumber && !/^\d{6,20}$/.test(accountNumber)) {
      return 'Account number must be 6–20 digits with no spaces or special characters.';
    }
    return null;
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both name and email.',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    const bankError = validateBankDetails();
    if (bankError) {
      toast({
        title: 'Invalid Bank Details',
        description: bankError,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const payload: {
        name: string;
        phone: string;
        email: string;
        accountNumber?: string;
        accountName?: string;
        bankName?: string;
      } = { name, phone, email };

      // Only include bank details if all three are provided
      if (accountNumber && accountName && bankName) {
        payload.accountNumber = accountNumber;
        payload.accountName = accountName;
        payload.bankName = bankName;
      }

      const response = await registerAgent(payload);

      console.log('API Response:', response);

      setReferralCode(response.agent.referralCode);
      localStorage.setItem('referralCode', JSON.stringify(response.agent.referralCode));
      setRegistered(true);

      toast({
        title: 'Registration Successful!',
        description: 'Your referral code has been generated.',
      });
    } catch (err: any) {
      toast({
        title: 'Registration Failed',
        description: err.message || 'Failed to register as agent',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Missing Information',
        description: 'Kindly provide your email.',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await getAgentLogin(referralCode, email);

      console.log('API Response:', response);
      localStorage.setItem('referralCode', JSON.stringify(response.agent.referralCode));
      setReferralCode(response.agent.referralCode);
      setRegistered(true);

      toast({
        title: 'Login Successful!',
        description: "You've successfully logged in.",
      });

      router.replace('/agents/dashboard');
    } catch (err: any) {
      toast({
        title: 'Login Failed',
        description: err.message || 'Failed to log in as agent',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Referral code copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Please copy the code manually.',
        variant: 'destructive',
      });
    }
  };

  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/login?ref=${referralCode}`
      : '';

  if (isLogin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Welcome back Agent
            </CardTitle>
            <CardDescription>
              Fill in your details to proceed to your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Your referral code is tied to this email
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Logging in...
                  </>
                ) : (
                  'Login as Agent'
                )}
              </Button>

              <div className="flex justify-between mt-4 text-sm">
                <a
                  href="#"
                  onClick={() => setIsLogin(false)}
                  className="text-primary underline"
                >
                  Don't have an account? Register
                </a>
              </div>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Benefits of Being an Agent:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Get your unique referral code</li>
                <li>• Track users who sign up with your code</li>
                <li>• Monitor market purchases using your referral</li>
                <li>• Earn rewards based on referral activity</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Become an Agent</h1>
        <p className="text-muted-foreground">
          Register to get your unique referral code and start earning
        </p>
      </div>

      {!registered ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Agent Registration
            </CardTitle>
            <CardDescription>
              Fill in your details to receive your unique referral code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegistration} className="space-y-6">

              {/* ── Personal Details ── */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="+2348012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your referral code will be tied to this email
                  </p>
                </div>
              </div>

              <Separator />

              {/* ── Bank Details ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Bank Details</p>
                  <span className="text-xs text-muted-foreground">(optional — for receiving payouts)</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    type="text"
                    placeholder="e.g. HSBC"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    inputMode="numeric"
                    placeholder="10-digit account number"
                    maxLength={20}
                    value={accountNumber}
                    onChange={(e) => {
                      // Allow digits only
                      const val = e.target.value.replace(/\D/g, '');
                      setAccountNumber(val);
                    }}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    type="text"
                    placeholder="Name on bank account"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* Partial-fill warning */}
                {[accountNumber, accountName, bankName].some(Boolean) &&
                  [accountNumber, accountName, bankName].some((v) => !v) && (
                    <p className="text-xs text-destructive">
                      Please fill in all three bank fields, or leave them all empty.
                    </p>
                  )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Registering...
                  </>
                ) : (
                  'Register as Agent'
                )}
              </Button>

              <div className="flex justify-between mt-4 text-sm">
                <a
                  href="#"
                  onClick={() => setIsLogin(true)}
                  className="text-primary underline"
                >
                  Already have an account? Login
                </a>
              </div>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Benefits of Being an Agent:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Get your unique referral code</li>
                <li>• Track users who sign up with your code</li>
                <li>• Monitor market purchases using your referral</li>
                <li>• Earn rewards based on referral activity</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              Registration Successful!
            </CardTitle>
            <CardDescription>Your agent account has been created</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your Referral Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={referralCode}
                    readOnly
                    className="font-mono text-lg font-bold"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyCode}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Your Referral Link</Label>
                <div className="flex gap-2">
                  <Input value={referralLink} readOnly className="text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(referralLink);
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
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Show bank details summary if provided */}
            {accountNumber && accountName && bankName && (
              <div className="p-4 border rounded-lg space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Bank Details Saved</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{bankName}</span> · {accountNumber}
                </p>
                <p className="text-sm text-muted-foreground">{accountName}</p>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Next Steps:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>1. Share your referral code or link with potential users</li>
                <li>2. Users can enter your code when buying markets</li>
                <li>3. Track your referrals in the agent dashboard</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/agents/dashboard')}
              >
                Go to Dashboard
              </Button>
              <Button className="flex-1" onClick={() => router.push('/')}>
                Back to Markets
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}