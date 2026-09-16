import type { Metadata } from 'next';
import { WaitlistAction } from '@/components/waitlist/action';
export const metadata:Metadata={title:'Waiting list',robots:{index:false,follow:false},referrer:'no-referrer'};
export default function Page(){return <WaitlistAction action="confirm"/>;}
