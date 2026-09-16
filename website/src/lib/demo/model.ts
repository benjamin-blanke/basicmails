export type Folder = 'inbox' | 'drafts' | 'sent' | 'archive' | 'spam' | 'trash';
export type View = Folder | 'starred' | 'all' | 'contacts' | 'settings';
export interface Attachment { id: string; name: string; type: string; size: number; data: string; }
export interface Mail { id: string; from: string; email: string; to: string; cc: string; bcc: string; subject: string; body: string; date: string; folder: Folder; previousFolder?: Folder; unread: boolean; starred: boolean; label: string; attachments: Attachment[]; }
export interface Contact { id: string; name: string; email: string; }
export interface MailboxState { version: 1; mails: Mail[]; contacts: Contact[]; settings: { name: string; signature: string; compact: boolean; }; }
export function isMailboxState(value: unknown): value is MailboxState {
  if (!value || typeof value !== 'object') return false;
  const s = value as MailboxState;
  return s.version === 1 && Array.isArray(s.mails) && s.mails.length <= 1000 && s.mails.every(m => typeof m.id === 'string' && typeof m.subject === 'string' && typeof m.body === 'string' && typeof m.from === 'string' && typeof m.email === 'string' && typeof m.to === 'string' && typeof m.date === 'string' && ['inbox','drafts','sent','archive','spam','trash'].includes(m.folder) && typeof m.label === 'string' && Array.isArray(m.attachments) && m.attachments.every(a => typeof a.name === 'string' && typeof a.data === 'string' && a.data.startsWith('data:'))) && Array.isArray(s.contacts) && s.contacts.every(c => typeof c.name === 'string' && typeof c.email === 'string') && typeof s.settings?.name === 'string' && typeof s.settings.signature === 'string' && typeof s.settings.compact === 'boolean';
}
