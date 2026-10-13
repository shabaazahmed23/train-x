import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'FITLIFE | Luxury Fitness & Athletic Club',
  description: 'Experience premier fitness training, private recovery pavilions, and personalized strength coaching at FITLIFE Bangalore.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark antialiased`}>
      <body className="min-h-screen bg-[#111111] text-[#F5F5F0] selection:bg-[#C8A96B] selection:text-black">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#F5F5F0',
              border: '1px solid #2D2D2D',
            },
          }}
        />
      </body>
    </html>
  );
}
