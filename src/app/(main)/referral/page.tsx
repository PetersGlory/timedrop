'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { getProfile } from '../account/api';

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simulate fetching referral code from user profile or localStorage
  useEffect(() => {
    getProfileInfo();
    // Replace with actual fetch from user profile if available
    const code = localStorage.getItem('referral_code') || generateReferralCode();
    setReferralCode(code);
  }, []);

  const getProfileInfo = async () => {
    setLoading(true)
    try{
        const token = localStorage.getItem('jwt_token');
        const profile = await getProfile(token as string);
        setReferralCode(profile?.timedropId);
    }catch(err){
        console.log(err)
    }finally{
        setLoading(false)
    }
  }

  function generateReferralCode() {
    // Simple random code for demo; replace with backend/user profile code
    const code = 'TD' + Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('referral_code', code);
    return code;
  }

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: 'Referral Link Copied!',
      description: 'Share this link with your friends to invite them.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-xl py-12">
      <h1 className="text-3xl font-bold mb-4">Referral Program</h1>
      <p className="mb-6 text-muted-foreground">
        Invite your friends to Timedrop and earn rewards! Share your unique referral link below. When your friends sign up and start trading, you both get bonuses.
      </p>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Your Referral Link</label>
        <div className="flex gap-2">
          <Input
            value={referralLink}
            readOnly
            className="flex-1"
          />
          <Button onClick={handleCopy} variant="outline">
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>
      <div className="mb-8">
        <label className="block mb-2 font-medium">Your Referral Code</label>
        <Input value={referralCode} readOnly />
      </div>
      <div className="bg-muted rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">How it works</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>Share your referral link or code with friends.</li>
          <li>When they register and make their first trade, you both earn a reward.</li>
          <li>Track your referrals and rewards in your account dashboard (coming soon).</li>
        </ul>
      </div>
    </div>
  );
}
