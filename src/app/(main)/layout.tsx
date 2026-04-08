
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User } from 'lucide-react';
import { useBookmarks } from '@/hooks/use-bookmarks'; // Hydration for bookmarks
import { useTheme } from 'next-themes';

const navItems = [
  { href: '/', label: 'Live Markets' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/account', label: 'Wallet' },
  // { href: '/transactions', label: 'Transaction History' },
];

// Utility hook to check login status from localStorage
function useIsLoggedIn() {
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const { setTheme } = useTheme();

  React.useEffect(() => {
    function checkLogin() {
      if (typeof window !== 'undefined') {
        const jwt = localStorage.getItem('jwt_token');
        const token = localStorage.getItem('token');
        const adminToken = localStorage.getItem('admin_token');
        setIsLoggedIn(Boolean(jwt || token || adminToken));
      }
    }
    checkLogin();
    setTheme('light');

    // Listen for custom logout/login events to update state
    function handleAuthChange() {
      checkLogin();
    }
    window.addEventListener('auth-changed', handleAuthChange);

    // Also listen for storage changes (e.g., in other tabs)
    function handleStorageChange(e: StorageEvent) {
      if (
        e.key === 'jwt_token' ||
        e.key === 'token' ||
        e.key === 'admin_token'
      ) {
        checkLogin();
      }
    }
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setTheme]);

  return isLoggedIn;
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Eagerly load bookmarks to prevent hydration issues on pages that use them.
  useBookmarks();

  const isLoggedIn = useIsLoggedIn();

  return (
    <React.Suspense>

    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b w-full mx-auto bg-background px-4 md:px-8 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 p-6 text-lg font-medium">
                  <Link
                    href="/"
                    className="mb-4 flex items-center md:ml-4 lg:ml-4 gap-2 text-lg font-semibold"
                  >
                    <span className="font-display text-base md:pl-4 lg:pl-4 pl-0 md:text-2xl font-bold tracking-tight text-primary">
                      timedrop
                    </span>
                  </Link>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'transition-colors hover:text-primary',
                        pathname === item.href
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex flex-col font-display text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-primary pl-0 md:pl-6">
              <span className="h-4 md:h-0" />
              <span>timedrop</span>
            </span>
          </Link>
        </div>
        
        <nav className="hidden flex-1 items-center justify-center gap-5 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-primary',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              {/* <Link href="/register">
                <Button variant="default">Get Started</Button>
              </Link> */}
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
      <footer className="border-t bg-background">
        <div className="container mx-auto flex h-16 items-center justify-center px-4 md:px-6">
          <nav className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="transition-colors hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              Careers
            </Link>
            <Link href="#" className="transition-colors hover:text-primary">
              Blog
            </Link>
            {/* <Link href="/referral" className="transition-colors hover:text-primary">
              Referral $
            </Link> */}
            <Link href="/framework" rel="noopener noreferrer" className="transition-colors hover:text-primary">
              Framework
            </Link>
            <Link href="/agents" className="transition-colors hover:text-primary">
              Become an Agent
            </Link>
            <a
              href="mailto:support@thetimedrop.com"
              className="transition-colors hover:text-primary"
            >
              support@thetimedrop.com
            </a>
          </nav>
        </div>
      </footer>
    </div>
    </React.Suspense>
  );
}

function UserMenu() {
  const router = useRouter();

  // Fire a custom event to notify auth state change
  const handleLogout = React.useCallback(() => {
    localStorage.clear();
    // Notify all listeners (including other tabs and this tab)
    window.dispatchEvent(new Event('auth-changed'));
    router.replace("/");
  }, [router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/transactions">Transaction History</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
