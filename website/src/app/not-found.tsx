import Link from 'next/link';
import { Icon } from '@/components/icon';
export default function NotFound(){return <section className="container page-intro not-found"><span className="eyebrow">404 / A LITTLE TOO QUIET</span><h1>This one's<br /><span className="serif">gone missing.</span></h1><p>The page you're looking for isn't here.<br />Let's get you back to familiar ground.</p><Link href="/" className="button dark-button">Back home <Icon name="arrow" size={17}/></Link></section>;}
