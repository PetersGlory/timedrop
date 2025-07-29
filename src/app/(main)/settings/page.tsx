
'use client';

import { useEffect, useState } from 'react';
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
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

// Import settings API functions
import { getSettings, updateSettings, updateNotificationPreferences, getProfile } from '../account/api';

export default function SettingsPage() {
  const { bookmarks } = useBookmarks();
  const auth = useAuth();

  const [profile, setProfile] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    marketUpdates: false,
    tradeConfirmations: false,
    promotions: false,
  });
  const [notifLoading, setNotifLoading] = useState(false);

  // Fetch settings and profile on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!auth?.token) return;
      setLoading(true);
      try {
        // Fetch user profile
        const profileData = await getProfile(auth.token);
        setProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
        });
        setName(
          [profileData.firstName, profileData.lastName].filter(Boolean).join(' ') || ''
        );
        setEmail(profileData.email || '');

        // Fetch settings (for notifications)
        const settingsData = await getSettings(auth.token);
        if (settingsData.notifications) {
          setNotifications({
            marketUpdates: !!settingsData.notifications.marketUpdates,
            tradeConfirmations: !!settingsData.notifications.tradeConfirmations,
            promotions: !!settingsData.notifications.promotions,
          });
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to load settings or profile.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [auth?.token]);

  // Handle profile save
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.token) return;
    setLoading(true);
    try {
      // Split name into first and last
      const [firstName, ...rest] = name.trim().split(' ');
      const lastName = rest.join(' ');
      await updateSettings(
        {
          firstName,
          lastName,
          email,
        },
        auth.token
      );
      setProfile({ firstName, lastName, email });
      toast({
        title: 'Settings Saved',
        description: 'Your changes have been successfully saved.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle notification preference change
  const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
    if (!auth?.token) return;
    setNotifLoading(true);
    try {
      const newPrefs = { ...notifications, [key]: value };
      setNotifications(newPrefs);
      await updateNotificationPreferences(
        {
          [key]: value,
        },
        auth.token
      );
      toast({
        title: 'Notification Preferences Updated',
        description: `Preference for ${key.replace(/([A-Z])/g, ' $1')} updated.`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update notification preferences.',
        variant: 'destructive',
      });
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <ProtectedRoute>
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
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  Save Changes
                </Button>
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
                <Switch
                  id="market-updates"
                  checked={notifications.marketUpdates}
                  onCheckedChange={checked =>
                    handleNotificationChange('marketUpdates', checked)
                  }
                  disabled={notifLoading || loading}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="trade-confirmations">Trade Confirmations</Label>
                  <p className="text-sm text-muted-foreground">
                    Get an email when your trades are executed.
                  </p>
                </div>
                <Switch
                  id="trade-confirmations"
                  checked={notifications.tradeConfirmations}
                  onCheckedChange={checked =>
                    handleNotificationChange('tradeConfirmations', checked)
                  }
                  disabled={notifLoading || loading}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="promotions">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional emails and special offers.
                  </p>
                </div>
                <Switch
                  id="promotions"
                  checked={notifications.promotions}
                  onCheckedChange={checked =>
                    handleNotificationChange('promotions', checked)
                  }
                  disabled={notifLoading || loading}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
