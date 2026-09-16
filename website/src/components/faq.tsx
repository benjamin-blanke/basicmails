'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from './icon';
const questions = [
 ['Can I create an account yet?', 'Not yet. Basic Mails is in development. You can explore the interactive design preview now, but it is not connected to a real mailbox.'],
 ['When will Basic Mails launch?', "We haven't announced a launch date. We want to get the essentials right before opening the doors. New milestones will appear in our build notes."],
 ['Is the inbox preview real?', 'The interactions are real; the messages are samples. You can search, star, archive, and write a demo draft. Nothing is sent, and changes disappear when you refresh.'],
 ['Will there be free accounts or custom domains?', "Plans, pricing, domains, and technical features haven't been finalized. We'll share confirmed details before launch."],
 ['How can I follow the project?', 'You can follow the Basic Mails repository on GitHub and check the build notes here. There is no email waiting list at the moment.'],
];
export function FAQ() { const [active,setActive]=useState<number|null>(0);return <section className="faq-section" id="questions"><div><span className="eyebrow">A FEW THINGS YOU MIGHT ASK</span><h2>Glad you<br /><span className="serif">asked.</span></h2></div><div>{questions.map(([q,a],i)=><div className="faq-item" key={q}><h3><button aria-expanded={active===i} aria-controls={`answer-${i}`} id={`question-${i}`} onClick={()=>setActive(active===i?null:i)}>{q}<Icon name="plus" className={active===i?'rotated':''}/></button></h3><AnimatePresence initial={false}>{active===i&&<motion.div id={`answer-${i}`} role="region" aria-labelledby={`question-${i}`} initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.25}}><p>{a}</p></motion.div>}</AnimatePresence></div>)}</div></section>; }
