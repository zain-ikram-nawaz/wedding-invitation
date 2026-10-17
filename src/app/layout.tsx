import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Naaz & Hassan · A celebration of love',
  description: 'Join us for the wedding of Noor-e-Chashmi Naaz Gul and Muhammad Hassan Sarmad. 4 November 2026, Crystal Banquet, Karachi.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
