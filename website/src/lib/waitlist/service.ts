import { createHash, createHmac, randomBytes } from 'node:crypto';
export const CONSENT_VERSION='launch-notification-v1';
const TWO_DAYS=172800, YEAR=31536000;
export function config(){
 const {RESEND_API_KEY,RESEND_FROM,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN}=process.env;
 if(!RESEND_API_KEY||!RESEND_FROM||!UPSTASH_REDIS_REST_URL||!UPSTASH_REDIS_REST_TOKEN)return null;
 if(!UPSTASH_REDIS_REST_URL.startsWith('https://'))return null;
 return {key:RESEND_API_KEY,from:RESEND_FROM,redisURL:UPSTASH_REDIS_REST_URL,redisToken:UPSTASH_REDIS_REST_TOKEN,origin:'https://www.basicmails.de'};
}
export function normalizeEmail(value:unknown):string|null {
 if(typeof value!=='string')return null;
 const email=value.trim().toLowerCase();
 return email.length<=254&&/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(email)&&!email.startsWith('.')&&!email.split('@')[0].includes('..')&&!email.split('@')[0].endsWith('.')?email:null;
}
export function digest(value:string){return createHash('sha256').update(value).digest('hex');}
export function validToken(token:unknown):token is string{return typeof token==='string'&&/^[a-f0-9]{64}$/.test(token);}
export async function redis<T>(command:(string|number)[]):Promise<T>{
 const c=config();if(!c)throw new Error('Not configured');
 const response=await fetch(c.redisURL,{method:'POST',headers:{Authorization:`Bearer ${c.redisToken}`,'Content-Type':'application/json'},body:JSON.stringify(command),cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw new Error('Storage unavailable');const data=await response.json();if(data.error)throw new Error('Storage unavailable');return data.result as T;
}
export const throttleScript=`local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n`;
export async function throttle(ip:string){
 const c=config();if(!c)throw new Error('Not configured');
 const id=createHmac('sha256',c.redisToken).update(ip).digest('hex');
 return await redis<number>(['EVAL',throttleScript,1,`wl:rate:${id}`,3600])<=5;
}
export type Entry={email:string;status:'pending'|'confirmed';requestedAt:string;confirmedAt?:string;consentVersion:string;unsubscribeKey:string;addressKey:string;unsubscribeToken:string};
export const confirmScript=`local raw=redis.call('GET',KEYS[1]); if not raw then return 0 end; local r=cjson.decode(raw); if r.status=='confirmed' then return 1 end; r.status='confirmed';r.confirmedAt=ARGV[1];redis.call('SET',KEYS[1],cjson.encode(r),'EX',ARGV[2]);redis.call('EXPIRE',r.unsubscribeKey,ARGV[2]);redis.call('EXPIRE',r.addressKey,ARGV[2]);redis.call('ZADD',KEYS[2],ARGV[3],KEYS[1]);return 1`;
export const removeScript=`local target=redis.call('GET',KEYS[1]);if target then local raw=redis.call('GET',target);if raw then local r=cjson.decode(raw);redis.call('DEL',r.addressKey);end;redis.call('DEL',target);redis.call('ZREM',KEYS[2],target);redis.call('DEL',KEYS[1]);end;return 1`;
export async function confirm(token:string){
 if(!validToken(token))return false;
 return await redis<number>(['EVAL',confirmScript,2,`wl:entry:${digest(token)}`,'wl:confirmed',new Date().toISOString(),YEAR,Math.floor(Date.now()/1000)+YEAR])===1;
}
export async function unsubscribe(token:string){
 if(!validToken(token))return false;
 await redis(['EVAL',removeScript,2,`wl:unsubscribe:${digest(token)}`,'wl:confirmed']);return true;
}
function escape(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
export function emailContent(confirmURL:string,unsubscribeURL:string){
 const text=`A little less noise. A little more hello.\n\nConfirm your place on the Basic Mails waiting list:\n${confirmURL}\n\nThe link expires in 48 hours. After confirming, you will receive a launch notification. This does not create an email account.\n\nNot you? Ignore this message; the unconfirmed request expires automatically. Or remove this request / unsubscribe at any time:\n${unsubscribeURL}\n\nBenjamin Blanke · Heiligenstraße 15 · 77933 Lahr · Germany\nhello@opus-host.de\nPrivacy: https://www.basicmails.de/datenschutz`;
 const html=`<!doctype html><html lang="en"><body style="margin:0;background:#171819;color:#ecebe8;font-family:Arial,sans-serif"><div style="max-width:540px;margin:auto;padding:48px 24px"><p style="font-size:22px">basicmails<span style="color:#aca1bd">.</span></p><p style="color:#aaa8ad;font-size:11px;letter-spacing:2px;margin-top:42px">ONE SMALL STEP</p><h1 style="font-size:34px;font-weight:500;line-height:1.15">Good things are<br>worth waiting for.</h1><p style="color:#aaa8ad;line-height:1.8">Confirm your email to join the Basic Mails waiting list. We will let you know when we launch.</p><a href="${escape(confirmURL)}" style="display:inline-block;padding:16px 22px;background:#dedbd6;color:#242426;border-radius:7px;text-decoration:none;margin:18px 0">Confirm my email</a><p style="font-size:13px;color:#aaa8ad;line-height:1.8">This link expires in 48 hours. Joining does not create an email account. If you did not request this, simply ignore this email.</p><p style="font-size:12px;line-height:1.8;color:#aaa8ad;border-top:1px solid #333436;padding-top:24px;margin-top:30px"><a style="color:#c7bdd6" href="${escape(unsubscribeURL)}">Remove request / unsubscribe</a> · <a style="color:#c7bdd6" href="https://www.basicmails.de/datenschutz">Privacy</a><br>Benjamin Blanke · Heiligenstraße 15 · 77933 Lahr · Germany<br>hello@opus-host.de</p></div></body></html>`;
 return {text,html};
}
export async function subscribe(email:string){
 const c=config();if(!c)throw new Error('Not configured');
 const lock=`wl:email:${digest(email)}`;
 const acquired=await redis<string|null>(['SET',lock,'1','NX','EX',3600]);if(!acquired)return;
 const total=await redis<number>(['EVAL',throttleScript,1,`wl:daily:${new Date().toISOString().slice(0,10)}`,86400]);
 if(total>100){await redis(['DEL',lock]);throw new Error('Daily limit');}
 const token=randomBytes(32).toString('hex'),removeToken=randomBytes(32).toString('hex');
 const entryKey=`wl:entry:${digest(token)}`,removeKey=`wl:unsubscribe:${digest(removeToken)}`;
 const entry:Entry={email,status:'pending',requestedAt:new Date().toISOString(),consentVersion:CONSENT_VERSION,unsubscribeKey:removeKey,unsubscribeToken:removeToken,addressKey:`wl:address:${digest(email)}`};
 // Both records are stored atomically before sending so every emailed link is usable.
 const stored=await redis<number>(['EVAL',"if redis.call('EXISTS',KEYS[3])==1 then return 0 end;redis.call('SET',KEYS[1],ARGV[1],'EX',ARGV[2]);redis.call('SET',KEYS[2],KEYS[1],'EX',ARGV[2]);redis.call('SET',KEYS[3],KEYS[1],'EX',ARGV[2]);return 1",3,entryKey,removeKey,entry.addressKey,JSON.stringify(entry),TWO_DAYS]);if(!stored)return;
 const content=emailContent(`${c.origin}/waitlist/confirm#${token}`,`${c.origin}/waitlist/unsubscribe#${removeToken}`);
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${c.key}`,'Content-Type':'application/json','Idempotency-Key':`waitlist-${digest(token)}`},body:JSON.stringify({from:c.from,to:[email],subject:'Confirm your place on the Basic Mails waiting list',...content}),signal:AbortSignal.timeout(10000)});
 if(!response.ok){await redis(['DEL',entryKey,removeKey,entry.addressKey,lock]);throw new Error('Email unavailable');}
 // On a network timeout records deliberately remain: Resend may have accepted the send.
}
