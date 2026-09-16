import { isIP } from 'node:net';
export type Connection = { ip:string; blocked:boolean; type:string; provider:string; asn:string };
export function clientIP(headers:Headers):string|null {
 // Vercel overwrites these headers. Do not accept a client-supplied query or cookie IP.
 const raw=(headers.get('x-vercel-forwarded-for')??headers.get('x-forwarded-for')??'').split(',')[0].trim();
 return isIP(raw)?raw:null;
}
export function parseConnection(body:unknown,ip:string):Connection {
 if(!body||typeof body!=='object')throw new Error('Invalid lookup');
 const data=body as Record<string,unknown>;
 if(data.status!=='ok'&&data.status!=='warning')throw new Error('Lookup unavailable');
 const entry=data[ip];if(!entry||typeof entry!=='object')throw new Error('Missing lookup');
 const item=entry as Record<string,unknown>;
 if(item.proxy!=='yes'&&item.proxy!=='no')throw new Error('Missing detection');
 const text=(value:unknown)=>typeof value==='string'&&value.length?value.slice(0,180):'Unavailable';
 const type=text(item.type);
 return {ip,blocked:item.proxy==='yes'||/^(hosting|vpn|tor|proxy)$/i.test(type),type,provider:text(item.provider),asn:text(item.asn)};
}
const cache=new Map<string,{value:Connection;until:number}>();
export async function checkConnection(ip:string,key:string,fetcher:typeof fetch=fetch):Promise<Connection>{
 if(!isIP(ip))throw new Error('Invalid address');
 const found=cache.get(ip);if(found&&found.until>Date.now())return found.value;
 const url=new URL(`https://proxycheck.io/v2/${encodeURIComponent(ip)}`);
 url.search=new URLSearchParams({key,vpn:'1',asn:'1'}).toString();
 const response=await fetcher(url,{cache:'no-store',signal:AbortSignal.timeout(4000)});
 if(!response.ok)throw new Error('Lookup unavailable');
 const value=parseConnection(await response.json(),ip);
 if(cache.size>=1000)cache.delete(cache.keys().next().value!);
 cache.set(ip,{value,until:Date.now()+(value.blocked?15000:60000)});
 return value;
}
