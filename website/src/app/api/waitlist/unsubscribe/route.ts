import { config,validToken,unsubscribe } from '@/lib/waitlist/service';
import { input,reply } from '@/lib/waitlist/http';
export const runtime='nodejs';
export async function POST(request:Request){
 let body;try{body=await input(request);}catch{return reply({error:'Invalid request.'},400);}
 if(!validToken(body.token))return reply({error:'This link is invalid. Please request a new one.'},400);
 if(!config())return reply({error:'The waiting list is temporarily unavailable. Please try again later.'},503);
 try{const ok=await unsubscribe(body.token);return ok?reply({success:true}):reply({error:'This link has expired or the request was removed. Please join again.'},410);}catch{return reply({error:'We could not complete this request. Please retry.'},503);}
}
