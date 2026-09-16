import { createHash, createHmac, randomBytes } from 'node:crypto';
export const CONSENT_VERSION='launch-notification-v1';
export class WaitlistError extends Error {
 code:string;providerStatus?:number;
 constructor(code:string,providerStatus?:number){super(code);this.code=code;this.providerStatus=providerStatus;this.name='WaitlistError';}
}
export function safeFailure(error:unknown){
 const code=error instanceof WaitlistError?error.code:'WAITLIST_INTERNAL';
 console.error(JSON.stringify({event:'waitlist_failure',code,status:error instanceof WaitlistError?error.providerStatus:undefined}));
 return code;
}
const TWO_DAYS=172800, YEAR=31536000, RESEND_COOLDOWN=300;
export function config(){
 const RESEND_API_KEY=process.env.RESEND_API_KEY?.trim(),RESEND_FROM=process.env.RESEND_FROM?.trim(),UPSTASH_REDIS_REST_URL=process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/,''),UPSTASH_REDIS_REST_TOKEN=process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
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
 let response:Response;try{response=await fetch(c.redisURL,{method:'POST',headers:{Authorization:`Bearer ${c.redisToken}`,'Content-Type':'application/json'},body:JSON.stringify(command),cache:'no-store',signal:AbortSignal.timeout(8000)});}catch{throw new WaitlistError('STORAGE_CONNECTION');}
 let data;try{data=await response.json();}catch{throw new WaitlistError('STORAGE_RESPONSE',response.status);}
 if(!response.ok||data.error){const msg=String(data.error??'').toLowerCase();const code=/noperm|read.?only|permission/.test(msg)?'STORAGE_PERMISSION':response.status===401||response.status===403||/unauthorized|token|authentication/.test(msg)?'STORAGE_AUTH':/quota|limit/.test(msg)?'STORAGE_LIMIT':'STORAGE_COMMAND';throw new WaitlistError(code,response.status);}
 return data.result as T;
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
 const text=`You are nearly on the BasicMails waiting list.\n\nConfirm your email:\n${confirmURL}\n\nWhat happens next:\n1. Confirm your email within 48 hours.\n2. We keep your place on the list.\n3. When BasicMails is ready, we will send one thoughtful launch email.\n\nThis does not create an email account. If this was not you, you can ignore this message or remove the request here:\n${unsubscribeURL}\n\nBest regards,\nZeno & Benjamin\nThe BasicMails Team\n\nBenjamin Blanke · Heiligenstraße 15 · 77933 Lahr · Germany\nhello@opus-host.de\nPrivacy: https://www.basicmails.de/datenschutz`;
 const html=`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"></head><body style="margin:0;padding:0;background:#0d0e10;color:#f4f2ee;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">One more click and your place is saved.</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d0e10"><tr><td align="center" style="padding:28px 14px 44px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px"><tr><td style="padding:16px 8px 26px"><span style="font-size:24px;line-height:1;font-weight:700;letter-spacing:-1.5px">basic</span><span style="font-size:24px;line-height:1;font-weight:400;letter-spacing:-1.5px">mails</span><span style="font-size:24px;line-height:1;color:#b8a9cf">.</span></td></tr><tr><td style="background:#18191c;border:1px solid #303136;border-radius:20px;padding:42px 34px 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><p style="margin:0 0 18px;color:#b8a9cf;font-size:11px;font-weight:700;letter-spacing:1.8px">YOU’RE ALMOST IN</p><h1 style="margin:0;color:#f4f2ee;font-size:38px;line-height:1.08;font-weight:500;letter-spacing:-1.8px">A calmer inbox<br>is waiting for you.</h1><p style="margin:24px 0 0;color:#b9bac0;font-size:16px;line-height:1.7">You asked to hear from us when BasicMails is ready. Confirm your email and we’ll keep your place on the list.</p></td></tr><tr><td style="padding:30px 0 18px"><a href="${escape(confirmURL)}" style="display:block;background:#f0ede7;border-radius:10px;color:#171719;font-size:16px;font-weight:700;letter-spacing:-.2px;padding:17px 20px;text-align:center;text-decoration:none">Confirm my email</a></td></tr><tr><td><p style="margin:0;color:#8f9199;font-size:12px;line-height:1.65;text-align:center">This confirmation link expires in 48 hours.</p></td></tr></table></td></tr><tr><td style="padding:22px 8px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#131417;border:1px solid #292a2e;border-radius:16px"><tr><td style="padding:22px 24px"><p style="margin:0 0 14px;color:#b8a9cf;font-size:11px;font-weight:700;letter-spacing:1.5px">WHAT HAPPENS NEXT</p><p style="margin:0;color:#c7c7cb;font-size:14px;line-height:1.8">1&nbsp;&nbsp; Confirm your email.<br>2&nbsp;&nbsp; We save your place.<br>3&nbsp;&nbsp; We send one thoughtful launch email when it’s time.</p></td></tr></table></td></tr><tr><td style="padding:28px 8px 0"><p style="margin:0;color:#b9bac0;font-size:14px;line-height:1.75">No account has been created yet. If you did not request this, simply ignore this email.</p><p style="margin:25px 0 0;color:#b9bac0;font-size:14px;line-height:1.7">Best regards,<br><strong style="color:#f4f2ee;font-weight:600">Zeno &amp; Benjamin</strong><br><span style="color:#b8a9cf">The BasicMails Team</span></p></td></tr><tr><td style="padding:30px 8px 0"><p style="border-top:1px solid #292a2e;margin:0;padding-top:20px;color:#777982;font-size:11px;line-height:1.75"><a href="${escape(unsubscribeURL)}" style="color:#b8a9cf;text-decoration:underline">Remove request / unsubscribe</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="https://www.basicmails.de/datenschutz" style="color:#b8a9cf;text-decoration:underline">Privacy</a><br>Benjamin Blanke · Heiligenstraße 15 · 77933 Lahr · Germany<br>hello@opus-host.de</p></td></tr></table></td></tr></table></body></html>`;
 const footer=`<tr><td align="center" style="padding:34px 8px 0"><div style="height:1px;background:#292a2e;font-size:1px;line-height:1px">&nbsp;</div><p style="margin:22px 0 10px;color:#9d9ea5;font-size:12px;letter-spacing:.2px">basicmails<span style="color:#b8a9cf">.</span></p><p style="margin:0;color:#777982;font-size:11px;line-height:1.7">A little less noise. A little more you.</p><p style="margin:18px 0 0;font-size:12px;line-height:1.7"><a href="${escape(unsubscribeURL)}" style="color:#b8a9cf;text-decoration:none;border-bottom:1px solid #60566f;padding-bottom:2px">Unsubscribe</a><span style="color:#4a4b51;padding:0 10px">/</span><a href="https://www.basicmails.de/datenschutz" style="color:#b8a9cf;text-decoration:none;border-bottom:1px solid #60566f;padding-bottom:2px">Privacy</a></p><p style="margin:18px 0 0;color:#5f6067;font-size:10px;line-height:1.7">You received this because you asked to join the BasicMails waiting list.<br>Benjamin Blanke · Heiligenstraße 15 · 77933 Lahr · Germany</p></td></tr>`;
 const polishedHtml=html.replace(/<tr><td style="padding:30px 8px 0">.*?<\/td><\/tr><\/table><\/td><\/tr><\/table><\/body><\/html>$/,`${footer}</table></td></tr></table></body></html>`);
 return {text,html:polishedHtml};
}
export async function subscribe(email:string){
 const c=config();if(!c)throw new Error('Not configured');
 if(!/^re_[A-Za-z0-9_-]+$/.test(c.key))throw new WaitlistError('EMAIL_KEY_FORMAT');
 const lock=`wl:email:${digest(email)}`;
 let acquired=await redis<string|null>(['SET',lock,'1','NX','EX',RESEND_COOLDOWN]);
 if(!acquired){
  const existingKey=await redis<string|null>(['GET',`wl:address:${digest(email)}`]);
  const existingRaw=existingKey?await redis<string|null>(['GET',existingKey]):null;
  if(existingRaw){try{const existing=JSON.parse(existingRaw) as Entry;if(existing.status==='pending'&&Date.now()-Date.parse(existing.requestedAt)>=RESEND_COOLDOWN*1000){await redis(['DEL',lock]);acquired=await redis<string|null>(['SET',lock,'1','NX','EX',RESEND_COOLDOWN]);}}catch{}}
 }
 if(!acquired)return false;
 const total=await redis<number>(['EVAL',throttleScript,1,`wl:daily:${new Date().toISOString().slice(0,10)}`,86400]);
 if(total>100){await redis(['DEL',lock]);throw new WaitlistError('DAILY_SEND_LIMIT');}
 const token=randomBytes(32).toString('hex'),removeToken=randomBytes(32).toString('hex');
 const entryKey=`wl:entry:${digest(token)}`,removeKey=`wl:unsubscribe:${digest(removeToken)}`;
 const entry:Entry={email,status:'pending',requestedAt:new Date().toISOString(),consentVersion:CONSENT_VERSION,unsubscribeKey:removeKey,unsubscribeToken:removeToken,addressKey:`wl:address:${digest(email)}`};
 // Both records are stored atomically before sending so every emailed link is usable.
 const stored=await redis<number>(['EVAL',"local old=redis.call('GET',KEYS[3]);if old then local raw=redis.call('GET',old);if raw then local previous=cjson.decode(raw);local ttl=redis.call('TTL',old);if previous.status~='pending' or ttl<0 or ttl>tonumber(ARGV[2])-300 then return 0 end;redis.call('DEL',previous.unsubscribeKey,old);end;end;redis.call('SET',KEYS[1],ARGV[1],'EX',ARGV[2]);redis.call('SET',KEYS[2],KEYS[1],'EX',ARGV[2]);redis.call('SET',KEYS[3],KEYS[1],'EX',ARGV[2]);return 1",3,entryKey,removeKey,entry.addressKey,JSON.stringify(entry),TWO_DAYS]);if(!stored)return false;
 const content=emailContent(`${c.origin}/waitlist/confirm#${token}`,`${c.origin}/waitlist/unsubscribe#${removeToken}`);
 let response:Response;try{response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${c.key}`,'Content-Type':'application/json','Idempotency-Key':`waitlist-${digest(token)}`},body:JSON.stringify({from:c.from,to:[email],subject:'One more click — confirm your BasicMails place',...content}),signal:AbortSignal.timeout(10000)});}catch{throw new WaitlistError('EMAIL_CONNECTION');}
 if(!response.ok){let detail:{name?:string;message?:string}={};try{detail=await response.json();}catch{}const name=String(detail.name??'');const msg=String(detail.message??'').toLowerCase();const code=/domain|verify|verified|testing emails/.test(msg)?'EMAIL_DOMAIN':response.status===401||name==='invalid_api_key'?'EMAIL_AUTH':/from|sender/.test(msg)?'EMAIL_SENDER':response.status===429?'EMAIL_LIMIT':response.status===403?'EMAIL_PERMISSION':'EMAIL_REJECTED';try{await redis(['DEL',entryKey,removeKey,entry.addressKey,lock]);}catch{safeFailure(new WaitlistError('EMAIL_CLEANUP'));}throw new WaitlistError(code,response.status);}
 console.info(JSON.stringify({event:'waitlist_email_accepted'}));
 return true;
}
