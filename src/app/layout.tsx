import type { Metadata } from 'next';
import './globals.css';
const title = 'Naaz & Hassan · A celebration of love';
const description = 'Join us for the wedding of Noor-e-Chashmi Naaz Gul and Muhammad Hassan Sarmad. 4 November 2026, Crystal Banquet, Karachi.';
// Link previews (WhatsApp, Facebook) need an absolute image URL, so set APP_ORIGIN before building.
const image = { url: '/og-image.png', width: 1200, height: 630, alt: 'Wedding invitation: Naaz & Hassan, Wednesday 4 November 2026, Crystal Banquet, Karachi' };
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN || 'http://localhost:3000'),
  title, description,
  robots: { index: false, follow: false },
  openGraph: { type: 'website', title, description, siteName: 'Naaz & Hassan', images: [image] },
  twitter: { card: 'summary_large_image', title, description, images: [image] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
