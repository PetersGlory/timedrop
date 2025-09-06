"use client"

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const possibleKeys = ['jwt_token', 'token', 'admin_token'];
    let foundToken: string | null = null;
    for (const key of possibleKeys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        foundToken = stored;
        break;
      }
    }
    if (!foundToken) {
      router.push('/login');
    }
  }, [router]);

  if (!token) return null; // or a loading spinner

  return <>{children}</>;
} 