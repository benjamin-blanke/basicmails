import type { Metadata } from 'next';
import './demo.css';
export const metadata: Metadata = { title: 'Private mailbox demo', robots: { index: false, follow: false } };
export default function DemoLayout({ children }: {children:React.ReactNode}) {return children;}
