import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Become — AI Wellness & Fitness Platform',
  description:
    'Transform your wellness with AI-powered form coaching, whole-food nutrition plans, and personalized mindfulness sessions.',
  openGraph: {
    title: 'Become — AI Wellness & Fitness Platform',
    description: 'Real-time AI form coaching, whole-food nutrition, and adaptive mindfulness.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 antialiased text-white">
        {children}
      </body>
    </html>
  );
}
