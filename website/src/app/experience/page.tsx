import type { Metadata } from 'next';
import { InboxDemo } from '@/components/inbox-demo';
import { Reveal } from '@/components/reveal';
import { Icon } from '@/components/icon';
import { LaunchCTA } from '@/components/launch-cta';
export const metadata: Metadata = { title: 'The experience' };
export default function Experience(){return <div className="container"><Reveal><section className="page-intro"><span className="eyebrow">MAKE YOURSELF AT HOME</span><h1>An inbox you can<br /><span className="serif gradient-text">exhale in.</span></h1><p>Click around. Open a conversation. Write a little hello.<br />This is a working design preview, with sample mail.</p></section></Reveal><Reveal><InboxDemo expanded /></Reveal><section className="preview-guide"><div><Icon name="search"/><h3>Find a little something.</h3><p>Search a sender, subject, or message. Try “coffee”.</p></div><div><Icon name="star"/><h3>Keep the good ones close.</h3><p>Star a message, mark it as read, or put it in the archive.</p></div><div><Icon name="pen"/><h3>Say a little hello.</h3><p>Write and save a demo draft. No emails are sent.</p></div></section><div className="honest-note"><Icon name="shield"/><p>This preview isn't a mail service. It uses fictional messages and stores changes only in the current page session. Refreshing resets everything.</p></div><LaunchCTA /></div>;}
