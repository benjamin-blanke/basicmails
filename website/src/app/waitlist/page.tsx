import type { Metadata } from 'next';
import { WaitlistForm } from '@/components/waitlist/form';
import { config } from '@/lib/waitlist/service';
export const metadata:Metadata={title:'Waiting list',description:'Get a little hello when Basic Mails launches. Join the waiting list with email confirmation.'};
export const dynamic='force-dynamic';
export default function Waitlist(){return <div className="container waitlist-page"><section className="page-intro"><span className="eyebrow">FIRST TO SAY HELLO</span><h1>Worth<br/><span className="serif gradient-text">waiting for.</span></h1><p>A calmer inbox is taking shape.<br/>Leave your email. We will let you know when it is ready.</p></section><WaitlistForm enabled={Boolean(config())}/></div>;}
