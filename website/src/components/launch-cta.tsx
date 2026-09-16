import Link from 'next/link';
import { Icon } from './icon';
import { Reveal } from './reveal';
export function LaunchCTA() { return <Reveal><section className="launch-cta"><span className="eyebrow">A FRESH START IS COMING</span><h2>Your inbox.<br /><span className="serif">A little more human.</span></h2><p>We're taking our time to get the basics right.<br />Get a little hello when we launch.</p><Link href="/waitlist" className="button dark-button">Join the waiting list <Icon name="arrow" size={17} /></Link><span className="cta-note">Coming soon. No launch date just yet.</span></section></Reveal>; }
