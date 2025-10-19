import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { OrganizationSchema, WebsiteSchema } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: {
    default: 'Timedrop - Predict Future Events | Prediction Market Platform',
    template: '%s | Timedrop'
  },
  description: 'Browse and predict on a variety of future events. Join Timedrop to make forecasts, track predictions, and compete with others in our prediction market platform.',
  keywords: [
    'prediction market',
    'forecasting',
    'future events',
    'predictions',
    'betting',
    'forecasting platform',
    'market prediction',
    'event prediction',
    'trading predictions',
    'financial forecasting',
    'crypto predictions',
    'stock market predictions',
    'sports predictions',
    'political predictions',
    'economic forecasting'
  ],
  authors: [{ name: 'Timedrop' }],
  creator: 'Timedrop',
  publisher: 'Timedrop',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://timedrop.live'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Timedrop - Predict Future Events',
    description: 'Browse and predict on a variety of future events. Join Timedrop to make forecasts and track your predictions in our prediction market platform.',
    url: 'https://timedrop.live',
    siteName: 'Timedrop',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Timedrop Prediction Market Platform - Predict Future Events',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Timedrop - Predict Future Events',
    description: 'Browse and predict on a variety of future events. Join our prediction market platform.',
    images: ['/twitter-image.png'],
    creator: '@timedrop',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: './favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700&display=swap"
          rel="stylesheet"
        />
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
