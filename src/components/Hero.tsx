'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Arrow } from './Icons';
const Scene = dynamic(() => import('./three/EnvelopeScene'), { ssr: false, loading: () => <div className="scene-loading">Preparing your invitation…</div> });

export default function Hero({ guest }: { guest: string }) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef({ value: 0 });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add({ reduced: '(prefers-reduced-motion: reduce)', animated: '(prefers-reduced-motion: no-preference)' }, (context) => {
      const reduce = !!context.conditions?.reduced;
      setReduced(reduce);
      progress.current.value = reduce ? 1 : 0;
      if (!reduce) gsap.to(progress.current, { value: 1, ease: 'none', scrollTrigger: {
        trigger: section.current, start: 'top top', end: 'bottom bottom', scrub: 1,
      } });
    });
    return () => media.revert();
  }, []);
  return <section id="invitation" ref={section} className={`hero ${reduced || paused ? 'motion-paused' : ''}`}>
    <div className="hero-sticky"><div className="hero-layout">
      <div className="hero-copy"><p className="eyebrow">AN INVITATION, FROM OUR HEARTS</p><h1>A little love.<br />A lifetime of<br /><em>togetherness.</em></h1><p className="hero-subtitle">Naaz & Hassan are getting married.<br />And you’re a part of our story.</p>
        <div className="guest-note"><span>RESERVED WITH LOVE FOR</span><strong>{guest || 'our dear family & friends'}</strong></div>
        <a className="button button-dark" href="#details">Open the invitation <Arrow /></a>
        <div className="hero-date">04 NOVEMBER 2026 <span>✦</span> KARACHI, PAKISTAN</div>
      </div>
      <div className="hero-visual" role="img" aria-label="An ivory 3D envelope opens as you scroll, surrounded by wedding rings and flowers.">
        <div className="visual-halo" /><span className="visual-caption">A NEW CHAPTER BEGINS</span>
        <Scene progress={progress} reduced={reduced || paused} guest={guest} />
        <div className="visual-bottom"><span>SCROLL TO UNFOLD OUR STORY</span><Arrow down /></div>
      </div>
    </div><div className="hero-bottom"><span>THE WEDDING OF NAAZ & HASSAN</span><button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? 'Resume motion' : 'Pause motion'}</button><span>SCROLL SLOWLY <span aria-hidden="true">↓</span></span></div></div>
  </section>;
}
