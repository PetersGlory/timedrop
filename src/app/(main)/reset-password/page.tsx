'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPassword } from '../account/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password validation states
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Check if token exists
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast({
        title: 'Invalid Reset Link',
        description: 'This reset password link is invalid or has expired.',
        variant: 'destructive',
      });
      router.push('/login');
    }
    localStorage.setItem("reset-tokens", token as string);
  }, [router]);

  // Password validation
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  // Confirm password validation
  const validateConfirmPassword = () => {
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  // Handle password change
  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    if (password) {
      validatePassword(password);
    } else {
      setPasswordErrors([]);
    }
    
    // Clear confirm password error when password changes
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (password: string) => {
    setConfirmPassword(password);
    if (password && newPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("reset-tokens");
    
    if (!token) {
      toast({
        title: 'Error',
        description: 'Reset token is missing',
        variant: 'destructive',
      });
      return;
    }

    // Validate passwords
    if (!validatePassword(newPassword)) {
      toast({
        title: 'Invalid Password',
        description: 'Please fix the password requirements above',
        variant: 'destructive',
      });
      return;
    }

    if (!validateConfirmPassword()) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await resetPassword(token, newPassword);
      
      if (response.success) {
        setSuccess(true);
        toast({
          title: 'Password Reset Successful',
          description: 'Your password has been reset successfully. You can now login with your new password.',
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      toast({
        title: 'Reset Failed',
        description: error.message || 'An error occurred while resetting your password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // If no token, show loading
  // if (!token) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
  //         <p className="mt-2 text-muted-foreground">Redirecting...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-green-600 dark:text-green-300 mb-4">
              Your password has been reset successfully. You will be redirected to the login page shortly.
            </p>
            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below to complete the reset process
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`pr-10 ${passwordErrors.length > 0 ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Password Requirements:</div>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-600' : 'text-red-500'}`}>
                      {newPassword.length >= 8 ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : 'text-red-500'}`}>
                      {/(?=.*[a-z])/.test(newPassword) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      One lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : 'text-red-500'}`}>
                      {/(?=.*[A-Z])/.test(newPassword) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${/(?=.*\d)/.test(newPassword) ? 'text-green-600' : 'text-red-500'}`}>
                      {/(?=.*\d)/.test(newPassword) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      One number
                    </div>
                    <div className={`flex items-center gap-2 ${/(?=.*[@$!%*?&])/.test(newPassword) ? 'text-green-600' : 'text-red-500'}`}>
                      {/(?=.*[@$!%*?&])/.test(newPassword) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      One special character (@$!%*?&)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`pr-10 ${confirmPasswordError ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {confirmPasswordError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || passwordErrors.length > 0 || !!confirmPasswordError || !newPassword || !confirmPassword}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/login')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
