import Link from 'next/link';
import { navigation, site } from '@/lib/site';
import { Icon } from './icon';
export function Footer() {
  return <footer className="site-footer"><div className="footer-top"><div><Link href="/" className="wordmark">basic<span>mails</span><i>.</i></Link><p>A little less noise.<br />A little more you.</p></div><div className="footer-links"><div><span>EXPLORE</span>{navigation.map(n => <Link href={n.href} key={n.href}>{n.label}</Link>)}</div><div><span>FOLLOW ALONG</span><a href={site.github} target="_blank" rel="noopener noreferrer">GitHub <Icon name="upRight" size={14} /></a><Link href="/updates#questions">Questions & answers</Link><Link href="/impressum">Impressum</Link></div></div></div><div className="footer-bottom"><span>© 2026 Basic Mails</span><span>Built by Benjamin & Zeno.</span><span className="footer-status"><span /> In the making</span></div><div className="footer-giant" aria-hidden="true">say hello.</div></footer>;
}
