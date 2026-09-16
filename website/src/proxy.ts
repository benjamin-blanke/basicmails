import { NextRequest, NextResponse } from 'next/server';
import { checkConnection, clientIP } from './lib/security/proxycheck';
import { restrictedHTML } from './lib/security/restricted';
export async function proxy(request:NextRequest){
 const path=request.nextUrl.pathname;
 // Legal information and sign-out stay accessible even from restricted networks.
 if(path==='/impressum'||path==='/impressum/'||path==='/api/demo/logout')return NextResponse.next();
 const key=process.env.PROXYCHECK_API_KEY?.trim();
 // Deploy the integration safely before its private API key is provisioned.
 if(!key)return NextResponse.next();
 const headers={'Cache-Control':'private, no-store, max-age=0','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer'};
 try{
  const ip=clientIP(request.headers);if(!ip)throw new Error('Missing address');
  const connection=await checkConnection(ip,key);
  if(!connection.blocked)return path==='/access-restricted'?NextResponse.redirect(new URL('/',request.url)):NextResponse.next();
  if(path.startsWith('/api/'))return NextResponse.json({error:'Access restricted. Disable your VPN or proxy and retry.'},{status:403,headers});
  if(path!=='/access-restricted')return NextResponse.redirect(new URL('/access-restricted',request.url),{headers});
  return new NextResponse(restrictedHTML(connection),{status:403,headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"}});
 }catch{
  // Do not label an outage, missing IP, exhausted quota or invalid key as a VPN.
  if(path.startsWith('/api/'))return NextResponse.json({error:'Connection check unavailable. Please retry.'},{status:503,headers:{...headers,'Retry-After':'15'}});
  return new NextResponse(restrictedHTML(null),{status:503,headers:{...headers,'Content-Type':'text/html; charset=utf-8','Retry-After':'15'}});
 }
}
export const config={matcher:['/((?!_next/static|_next/image|icon.svg|favicon.ico|robots.txt|sitemap.xml).*)']};
