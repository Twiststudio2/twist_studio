import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { BrandTheme } from '@/components/brand-theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://twiststudio.africa'),
  title: 'Twist Studio — Africa\'s Creative Powerhouse',
  description: 'Premium creative agency offering branding, web design, graphic design, video editing, motion graphics, and more.',
  openGraph: {
    title: 'Twist Studio — Africa\'s Creative Powerhouse',
    description: 'Premium creative agency offering branding, web design, graphic design, video editing, motion graphics, and more.',
    images: [{ url: '/assets/marketing-materials/twist_sudio_B-card_[Recovered]-01.jpg' }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <BrandTheme />
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
