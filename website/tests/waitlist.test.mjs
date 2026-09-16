import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeEmail,validToken,digest,subscribe,confirm,unsubscribe,emailContent,config,redis} from '../src/lib/waitlist/service.ts';
test('email validation rejects header injection and malformed addresses',()=>{
 assert.equal(normalizeEmail(' Alex+demo@Example.com '),'alex+demo@example.com');
 for(const value of [null,42,'a@','a@example','a..b@example.com','a@example.com\r\nBcc: victim@example.com','.a@example.com'])assert.equal(normalizeEmail(value),null);
 assert.equal(validToken('a'.repeat(64)),true);assert.equal(validToken('a'.repeat(63)),false);
});
test('invalid tokens cannot reach persistence',async()=>{const original=global.fetch;global.fetch=()=>{throw new Error('unexpected call');};try{assert.equal(await confirm('bad'),false);assert.equal(await unsubscribe('bad'),false);}finally{global.fetch=original;}});
test('signup persists pending state before requesting mail; links have independent tokens and no query-string secrets',async()=>{
 Object.assign(process.env,{RESEND_API_KEY:'test-only',RESEND_FROM:'Basic Mails <hello@basicmails.de>',UPSTASH_REDIS_REST_URL:'https://redis.example',UPSTASH_REDIS_REST_TOKEN:'test-only'});
 const original=global.fetch;const commands=[];let message;
 global.fetch=async(url,options)=>{const body=JSON.parse(options.body);if(String(url)==='https://redis.example'){commands.push(body);return Response.json({result:body[0]==='SET'?'OK':1});}assert.equal(String(url),'https://api.resend.com/emails');assert.equal(commands.length,3);message=body;assert.match(options.headers['Idempotency-Key'],/^waitlist-[a-f0-9]{64}$/);return Response.json({id:'test-id'});};
 try{await subscribe('alex@example.com');assert.equal(message.to[0],'alex@example.com');const confirmURL=message.text.match(/https:\/\/www.basicmails.de\/waitlist\/confirm#[a-f0-9]{64}/)[0];const removeURL=message.text.match(/https:\/\/www.basicmails.de\/waitlist\/unsubscribe#[a-f0-9]{64}/)[0];const a=new URL(confirmURL),b=new URL(removeURL);assert.equal(a.search,'');assert.notEqual(a.hash,b.hash);const pending=JSON.parse(commands[2][6]);assert.equal(pending.status,'pending');assert.equal(pending.consentVersion,'launch-notification-v1');assert.ok(!message.html.includes('test-only'));assert.equal(commands[2][3],`wl:entry:${digest(a.hash.slice(1))}`);}finally{global.fetch=original;}
});
test('provider rejection cleans up pending records and fails visibly',async()=>{
 const original=global.fetch;const commands=[];global.fetch=async(url,options)=>{if(String(url)==='https://redis.example'){const c=JSON.parse(options.body);commands.push(c);return Response.json({result:c[0]==='SET'?'OK':1});}return Response.json({message:'invalid sender'},{status:422});};try{await assert.rejects(subscribe('rejected@example.com'),/Email unavailable/);assert.equal(commands.at(-1)[0],'DEL');assert.equal(commands.at(-1).length,5);}finally{global.fetch=original;}
});
test('duplicates do not send; storage errors fail closed',async()=>{
 const original=global.fetch;let n=0;global.fetch=async()=>{n++;return Response.json({result:null});};try{await subscribe('duplicate@example.com');assert.equal(n,1);global.fetch=async()=>Response.json({error:'unavailable'});await assert.rejects(redis(['GET','x']),/Storage unavailable/);}finally{global.fetch=original;}
});
test('email markup escapes link values',()=>{assert.ok(!emailContent('https://example.com/" onclick="bad','x').html.includes('href="https://example.com/" onclick='));});
