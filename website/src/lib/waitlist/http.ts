import { sameOrigin } from '../demo/auth';
export function reply(body:object,status=200){return Response.json(body,{status,headers:{'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}});}
export async function input(request:Request){
 if(!sameOrigin(request))throw new Error('origin');
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw new Error('input');
 if(Number(request.headers.get('content-length')??0)>2048)throw new Error('input');
 const reader=request.body?.getReader();if(!reader)throw new Error('input');
 let size=0,text='';const decoder=new TextDecoder();
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2048){await reader.cancel();throw new Error('input');}text+=decoder.decode(value,{stream:true});}
 const body=JSON.parse(text+decoder.decode());if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('input');return body;
}
