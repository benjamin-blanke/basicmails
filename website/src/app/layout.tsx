import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Providers } from '@/components/providers';
import { site } from '@/lib/site';
import { SiteChrome } from '@/components/site-chrome';
import './globals.css';
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
export const metadata: Metadata = { metadataBase: new URL(site.url), title: { default: 'Basic Mails — Email, with room to breathe.', template: '%s · Basic Mails' }, description: site.description, icons: { icon: '/icon.svg' }, openGraph: { title: 'Basic Mails — Email, with room to breathe.', description: site.description, type: 'website', siteName: site.name } };
export default function RootLayout({ children }: Readonly<{children:React.ReactNode}>) { return <html lang="en" data-theme="dark"><body className={geist.variable}><Providers><a className="skip-link" href="#main">Skip to content</a><SiteChrome header={<Header />} footer={<Footer />}>{children}</SiteChrome></Providers></body></html>; }
