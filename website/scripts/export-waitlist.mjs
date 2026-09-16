// Run with: node --experimental-strip-types scripts/export-waitlist.mjs > waitlist.json
// Keep exports private. This script never sends mail.
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const {redis,config}=await import('../src/lib/waitlist/service.ts');
if(!config())throw new Error('Configure the waiting-list environment variables first.');
const now=Math.floor(Date.now()/1000);
await redis(['ZREMRANGEBYSCORE','wl:confirmed','-inf',now]);
const ids=await redis(['ZRANGEBYSCORE','wl:confirmed',now+1,'+inf']);
const rows=[];
for(const id of ids){const raw=await redis(['GET',id]);if(!raw)continue;const r=JSON.parse(raw);if(r.status==='confirmed')rows.push({email:r.email,requestedAt:r.requestedAt,confirmedAt:r.confirmedAt,consentVersion:r.consentVersion,unsubscribeUrl:`https://www.basicmails.de/waitlist/unsubscribe#${r.unsubscribeToken}`});}
console.log(JSON.stringify(rows,null,2));
