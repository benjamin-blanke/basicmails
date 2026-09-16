import { redirect } from 'next/navigation';
import { demoPassword, getSession } from '@/lib/demo/auth';
import { Login } from '@/components/demo/login';
export const dynamic = 'force-dynamic';
export default async function DemoLogin() {if(await getSession())redirect('/demo');return <Login configured={Boolean(demoPassword())}/>;}
