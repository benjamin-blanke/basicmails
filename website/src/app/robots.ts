import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/demo','/api/','/waitlist/confirm','/waitlist/unsubscribe','/access-restricted']},sitemap:`${site.url}/sitemap.xml`};}
