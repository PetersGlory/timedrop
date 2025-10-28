import type { Metadata } from 'next';
import Script from 'next/script';
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
        {/* ✅ TikTok Pixel Script */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;
              var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){
                for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);
                return e
              };
              ttq.load=function(e,n){
                var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
                ttq._i=ttq._i||{};
                ttq._i[e]=[];
                ttq._i[e]._u=r;
                ttq._t=ttq._t||{};
                ttq._t[e]=+new Date;
                ttq._o=ttq._o||{};
                ttq._o[e]=n||{};
                n=document.createElement("script");
                n.type="text/javascript";
                n.async=!0;
                n.src=r+"?sdkid="+e+"&lib="+t;
                e=document.getElementsByTagName("script")[0];
                e.parentNode.insertBefore(n,e)
              };
              ttq.load('D40BB1RC77U53GC030N0');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
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
