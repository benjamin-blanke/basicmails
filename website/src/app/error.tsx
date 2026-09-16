'use client';
export default function Error({reset}:{error:Error & {digest?:string};reset:()=>void}){return <section className="container page-intro"><span className="eyebrow">A SMALL INTERRUPTION</span><h1>Let's try<br /><span className="serif">that again.</span></h1><p>Something didn't load as expected.</p><button className="button dark-button" onClick={reset}>Try again</button></section>;}
