'use client';
import { useEffect, useRef, type ReactNode } from 'react';
export function DemoDialog({open,onClose,title,children,wide=false}:{open:boolean;onClose:()=>void;title:string;children:ReactNode;wide?:boolean}) {
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(open&&!ref.current?.open)ref.current?.showModal();else if(!open&&ref.current?.open)ref.current.close();},[open]);
 return <dialog ref={ref} className={`demo-dialog ${wide?'wide':''}`} onCancel={e=>{e.preventDefault();onClose();}} onClose={onClose} aria-label={title}><div className="demo-dialog-title"><h2>{title}</h2><button type="button" onClick={onClose} aria-label={`Close ${title}`}>Close</button></div>{children}</dialog>;
}
