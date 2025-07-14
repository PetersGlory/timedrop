
'use client';

import Link from 'next/link';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { Bookmark } from 'lucide-react';

export default function SettingsPage() {
  const { bookmarks } = useBookmarks();

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Settings Saved',
      description: 'Your changes have been successfully saved.',
    });
  };

  return (
    <div className="container mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </header>

      <div className="space-y-8">
        <Card>
          <form onSubmit={handleSaveChanges}>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="market-updates">Market Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about new markets and outcomes.
                </p>
              </div>
              <Switch id="market-updates" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="trade-confirmations">Trade Confirmations</Label>
                <p className="text-sm text-muted-foreground">
                  Get an email when your trades are executed.
                </p>
              </div>
              <Switch id="trade-confirmations" />
            </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="promotions">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotional emails and special offers.
                </p>
              </div>
              <Switch id="promotions" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
