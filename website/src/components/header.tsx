'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from './icon';
import { navigation } from '@/lib/site';

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => { const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }; document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape); }, []);
  return <header className="site-header"><div className="nav-wrap"><Link href="/" className="wordmark" aria-label="Basic Mails home"><span className="brand-icon">@</span>basic<span>mails</span><i>.</i></Link><nav className="desktop-nav" aria-label="Main navigation">{navigation.map(item => <Link key={item.href} href={item.href} aria-current={path === item.href ? 'page' : undefined}>{item.label}</Link>)}</nav><div className="nav-actions"><Link href="/updates" className="nav-status"><span /> Coming soon</Link><button aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-nav" className="icon-button menu-button" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button></div></div>{open && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">{navigation.map(item => <Link key={item.href} href={item.href} aria-current={path === item.href ? 'page' : undefined}>{item.label}<Icon name="arrow" size={17} /></Link>)}</nav>}</header>;
}
