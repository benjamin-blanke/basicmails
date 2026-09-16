import test from 'node:test';
import assert from 'node:assert/strict';
import { clientIP, parseConnection, checkConnection } from '../src/lib/security/proxycheck.ts';
import { restrictedHTML } from '../src/lib/security/restricted.ts';
const ip='203.0.113.7';
const result=(overrides={})=>({status:'ok',[ip]:{proxy:'no',type:'Residential',provider:'Example ISP',asn:'AS64500',...overrides}});
test('Vercel IP takes precedence; invalid and missing addresses rejected',()=>{
 assert.equal(clientIP(new Headers({'x-vercel-forwarded-for':'2001:db8::1','x-forwarded-for':ip})),'2001:db8::1');
 assert.equal(clientIP(new Headers({'x-forwarded-for':ip+', 192.0.2.1'})),ip);
 assert.equal(clientIP(new Headers({'x-forwarded-for':'not-an-ip'})),null);
 assert.equal(clientIP(new Headers()),null);
});
test('classifies residential, VPN, proxy, hosting and Tor without treating API failures as detections',()=>{
 assert.equal(parseConnection(result(),ip).blocked,false);
 for(const type of ['VPN','Hosting','TOR','Proxy'])assert.equal(parseConnection(result({type}),ip).blocked,true);
 assert.equal(parseConnection(result({proxy:'yes',type:'Residential'}),ip).blocked,true);
 assert.equal(parseConnection({...result(),status:'warning'},ip).blocked,false);
 for(const body of [{status:'error'}, {status:'ok'}, {status:'ok',[ip]:{type:'Hosting'}}])assert.throws(()=>parseConnection(body,ip));
});
test('server lookup uses HTTPS and both detection flags, validates response, and caches successful results',async()=>{
 let calls=0;
 const fetcher=async(url,options)=>{calls++;assert.equal(url.origin,'https://proxycheck.io');assert.equal(url.searchParams.get('vpn'),'1');assert.equal(url.searchParams.get('asn'),'1');assert.equal(url.searchParams.get('key'),'test-private-key');assert.equal(options.cache,'no-store');return new Response(JSON.stringify(result()));};
 assert.equal((await checkConnection(ip,'test-private-key',fetcher)).blocked,false);
 await checkConnection(ip,'test-private-key',fetcher);assert.equal(calls,1);
 await assert.rejects(checkConnection('192.0.2.2','test-private-key',async()=>new Response('{}',{status:429})));
 await assert.rejects(checkConnection('not-ip','test-private-key',fetcher));
});
test('restriction screen escapes provider data and keeps legal/help/retry links; outages have distinct copy',()=>{
 const html=restrictedHTML(parseConnection(result({proxy:'yes',provider:'<script>alert(1)</script>'}),ip));
 assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(html.includes('href="/impressum"'));assert.ok(html.includes('Retry'));assert.ok(html.includes(ip));
 const error=restrictedHTML(null);assert.ok(error.includes('Unable to verify'));assert.ok(!error.includes('detected a VPN'));
});
