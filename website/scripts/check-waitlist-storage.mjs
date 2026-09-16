// Read-only deployment diagnostic. No credentials, data, IPs or provider bodies are logged.
const url=process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/,''),token=process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
if(!url||!token){console.log('WAITLIST_STORAGE_CHECK: NOT_CONFIGURED');}else{
 for(const command of [['PING'],['EVAL','return 1',0]]){
  try{const res=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(8000)});let data;try{data=await res.json();}catch{data={error:'invalid response'};}const msg=String(data.error??'').toLowerCase();const result=res.ok&&!data.error?'OK':/noperm|read.?only|permission/.test(msg)?'PERMISSION_DENIED':res.status===401||res.status===403||/unauthorized|token|authentication/.test(msg)?'AUTH_FAILED':/quota|limit/.test(msg)?'LIMIT_REACHED':'COMMAND_FAILED';console.log(`WAITLIST_STORAGE_CHECK ${command[0]}: ${result} HTTP ${res.status}`);}catch{console.log(`WAITLIST_STORAGE_CHECK ${command[0]}: CONNECTION_FAILED`);}
 }
}
const resendKey=process.env.RESEND_API_KEY?.trim(),sender=process.env.RESEND_FROM?.trim();
if(resendKey&&sender){
 const match=sender.match(/^(?:[^<>\r\n]+<)?([^<>\s@]+@[^<>\s@]+)>?$/);
 const address=match?.[1];const domain=address?.split('@')[1];
 console.log(`WAITLIST_EMAIL_CHECK SENDER_FORMAT: ${address?'OK':'INVALID'}`);
 console.log(`WAITLIST_EMAIL_CHECK KEY_WHITESPACE: ${/\s/.test(resendKey)?'INVALID':'OK'}`);
 console.log(`WAITLIST_EMAIL_CHECK KEY_CHARACTERS: ${/^[A-Za-z0-9_]+$/.test(resendKey)?'OK':'INVALID'}`);
 console.log(`WAITLIST_EMAIL_CHECK KEY_PREFIX: ${resendKey.startsWith('re_')?'OK':'INVALID'}`);
 console.log(`WAITLIST_EMAIL_CHECK REQUESTED_SENDER: ${address==='team@basicmails.de'?'MATCH':'DIFFERENT'}`);
 try{const res=await fetch('https://api.resend.com/domains',{headers:{Authorization:`Bearer ${resendKey}`},signal:AbortSignal.timeout(8000)});let body;try{body=await res.json();}catch{console.log(`WAITLIST_EMAIL_CHECK NON_JSON: HTTP ${res.status}`);body={};}if(res.ok){const found=body.data?.find(d=>d.name===domain);console.log(`WAITLIST_EMAIL_CHECK DOMAIN: ${found?String(found.status).replace(/[^a-z_]/g,'').slice(0,30):'NOT_IN_ACCOUNT'}`);}else{const known=['restricted_api_key','invalid_api_key','missing_api_key','rate_limit_exceeded','validation_error'];console.log(`WAITLIST_EMAIL_CHECK KEY: ${known.includes(body.name)?body.name:'LOOKUP_UNAVAILABLE'} HTTP ${res.status}`);}}catch(error){console.log(`WAITLIST_EMAIL_CHECK REASON: ${/ByteString|greater than 255/.test(error?.message??'')?'NON_ASCII_HEADER':/invalid.*header|header.*invalid/i.test(error?.message??'')?'INVALID_HEADER':/fetch failed/i.test(error?.message??'')?'FETCH_FAILED':'OTHER'}`);console.log(`WAITLIST_EMAIL_CHECK: CONNECTION_FAILED TYPE ${['TypeError','TimeoutError','AbortError'].includes(error?.name)?error.name:'Error'} CODE ${/^[A-Z_]+$/.test(error?.cause?.code??'')?error.cause.code:'UNKNOWN'}`);}
}
