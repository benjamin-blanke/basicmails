import { config,normalizeEmail,subscribe,throttle,safeFailure } from '@/lib/waitlist/service';
import { input,reply } from '@/lib/waitlist/http';
import { clientIP } from '@/lib/security/proxycheck';
export const runtime='nodejs';
export async function POST(request:Request){
 let body;try{body=await input(request);}catch{return reply({error:'Invalid request.'},400);}
 if(body.website)return reply({message:'Check your inbox for a confirmation link.'});
 const email=normalizeEmail(body.email);if(!email||body.consent!==true)return reply({error:'Enter a valid email and agree to the launch notification.'},400);
 if(!config())return reply({error:'The waiting list is not open yet. Please check back soon.'},503);
 try{if(!await throttle(clientIP(request.headers)??'unknown'))return reply({error:'Too many requests. Please try again in an hour.'},429);const sent=await subscribe(email);return sent?reply({message:'Check your inbox and spam folder. Confirm your email to join.'}):reply({message:'A confirmation email was requested recently. Please wait five minutes, then try again.'});}catch(error){const code=safeFailure(error);return reply({error:`We could not complete your request. Please try again later. Reference: ${code}`},503);}
}
