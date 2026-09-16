// Read-only deployment diagnostic. No credentials, data, IPs or provider bodies are logged.
const url=process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/,''),token=process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
if(!url||!token){console.log('WAITLIST_STORAGE_CHECK: NOT_CONFIGURED');}else{
 for(const command of [['PING'],['EVAL','return 1',0]]){
  try{const res=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(8000)});let data;try{data=await res.json();}catch{data={error:'invalid response'};}const msg=String(data.error??'').toLowerCase();const result=res.ok&&!data.error?'OK':/noperm|read.?only|permission/.test(msg)?'PERMISSION_DENIED':res.status===401||res.status===403||/unauthorized|token|authentication/.test(msg)?'AUTH_FAILED':/quota|limit/.test(msg)?'LIMIT_REACHED':'COMMAND_FAILED';console.log(`WAITLIST_STORAGE_CHECK ${command[0]}: ${result} HTTP ${res.status}`);}catch{console.log(`WAITLIST_STORAGE_CHECK ${command[0]}: CONNECTION_FAILED`);}
 }
}
