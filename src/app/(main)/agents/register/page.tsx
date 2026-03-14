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
import { toast } from '@/hooks/use-toast';
import { Copy, CheckCircle2, UserPlus } from 'lucide-react';
import { getAgentLogin, registerAgent } from '../../account/api';

export default function AgentRegistration() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  // Function to generate unique referral code
  const generateReferralCode = (email: string) => {
    const emailPrefix = email.split('@')[0].substring(0, 4).toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${emailPrefix}${randomSuffix}`;
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

    // Validate email format
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
      // Generate referral code
      const newReferralCode = generateReferralCode(email);

      // TODO: Replace with actual API call
      const response = await registerAgent({
        name,
        phone,
        email,
        referralCode: newReferralCode,
      });

      console.log('API Response:', response);

      setReferralCode(response.agent.referralCode || newReferralCode);
      localStorage.setItem("referralCode", JSON.stringify(response.agent.referralCode));
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

    // Validate email format
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

      // TODO: Replace with actual API call
      const response = await getAgentLogin(referralCode, email);

      console.log('API Response:', response);
      localStorage.setItem("referralCode", JSON.stringify(response.agent.referralCode));
      setReferralCode(response.agent.referralCode);
      setRegistered(true);

      toast({
        title: 'Login Successful!',
        description: "You've succesfully logged In.",
      });

      router.replace("/agents/dashboard")
    } catch (err: any) {
      toast({
        title: 'Login Failed',
        description: err.message || 'Failed to register as agent',
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

      if(isLogin){
        return (
          <>
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
                      Your referral code will be tied to this email
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Logging in...
                      </>
                    ) : (
                      'Login as Agent'
                    )}
                  </Button>
                  
                  <div className="flex justify-between mt-4 text-sm">
                    <a href='#' type='button' onClick={()=> setIsLogin(false)} className="text-primary underline">
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
          </>
        )
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
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="Enter your Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </>
                ) : (
                  'Register as Agent'
                )}
              </Button>

              <div className="flex justify-between mt-4 text-sm">
                <a href="#" type='button' onClick={()=> setIsLogin(true)} className="text-primary underline">
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
            <CardDescription>
              Your agent account has been created
            </CardDescription>
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
                  <Input
                    value={referralLink}
                    readOnly
                    className="text-sm"
                  />
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
              <Button
                className="flex-1"
                onClick={() => router.push('/')}
              >
                Back to Markets
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}