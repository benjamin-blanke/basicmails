import { redirect } from 'next/navigation';
import { demoPassword, getSession } from '@/lib/demo/auth';
import { mailboxKey } from '@/lib/demo/crypto';
import { seedMailbox } from '@/lib/demo/seed';
import { Mailbox } from '@/components/demo/mailbox';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export default async function Demo() {
 const session=await getSession();
 if(!session)redirect('/demo/login');
 return <Mailbox initial={seedMailbox()} storageKey={mailboxKey(demoPassword()!)} expiresAt={session.exp}/>;
}
