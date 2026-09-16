import { isMailboxState, type MailboxState } from './model';
const STORAGE = 'basicmails-encrypted-demo-v1';
function bytes(value: string) { return Uint8Array.from(atob(value), c=>c.charCodeAt(0)); }
function base64(value: Uint8Array) { let result=''; for (const byte of value) result+=String.fromCharCode(byte); return btoa(result); }
async function key(value: string) { return crypto.subtle.importKey('raw',bytes(value),'AES-GCM',false,['encrypt','decrypt']); }
export async function loadMailbox(secret: string): Promise<MailboxState | null> {
 const stored=localStorage.getItem(STORAGE); if(!stored)return null;
 const {iv,data}=JSON.parse(stored);
 const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(iv)},await key(secret),bytes(data));
 const value=JSON.parse(new TextDecoder().decode(plain));
 if(!isMailboxState(value))throw new Error('Invalid saved mailbox');
 return value;
}
export async function encryptMailbox(state: MailboxState, secret: string) {
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(secret),new TextEncoder().encode(JSON.stringify(state)));
 return JSON.stringify({iv:base64(iv),data:base64(new Uint8Array(encrypted))});
}
export function saveEncryptedMailbox(value: string) { localStorage.setItem(STORAGE,value); }
export function clearMailbox() { localStorage.removeItem(STORAGE); }
