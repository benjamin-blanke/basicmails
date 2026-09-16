'use client';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './icon';
export interface Draft { to: string; subject: string; body: string; }
export function ComposeDialog({ open, onClose, onSave, draft }: { open: boolean; onClose: () => void; onSave: (draft: Draft) => void; draft: Draft | null }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  useEffect(() => { if (open) { setTo(draft?.to ?? ''); setSubject(draft?.subject ?? ''); setBody(draft?.body ?? ''); ref.current?.showModal(); } else ref.current?.close(); }, [open, draft]);
  return <dialog ref={ref} className="compose-dialog" onCancel={onClose} onClose={onClose} aria-labelledby="compose-title"><form onSubmit={e => { e.preventDefault(); onSave({ to, subject, body }); onClose(); }}><div className="compose-title"><h2 id="compose-title">A new conversation.</h2><button type="button" className="icon-button" aria-label="Close draft editor" onClick={onClose}><Icon name="close" /></button></div><p className="compose-notice">Demo only. Nothing will be sent. Your draft stays in this page until you refresh.</p><label><span>To</span><input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="friend@example.com" autoComplete="off" required /></label><label><span>Subject</span><input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Something worth saying" required maxLength={150} /></label><label className="body-label"><span className="sr-only">Message</span><textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Hey there," required maxLength={10000} /></label><div className="compose-bottom"><button className="button purple-button" type="submit">Save demo draft <Icon name="check" size={17} /></button><span>Not connected to a mailbox</span></div></form></dialog>;
}
