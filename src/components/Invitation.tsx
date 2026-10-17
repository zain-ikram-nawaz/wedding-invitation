'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { wedding, mapsEmbedURL, mapsURL, googleCalendarURL } from '@/lib/wedding';
import { normalizeGuest } from '@/lib/rsvp-validation';
import Hero from './Hero';
import RSVPForm from './RSVPForm';
import MusicToggle from './MusicToggle';
import { Arrow, Flower } from './Icons';

export default function Invitation() {
  const params = useSearchParams();
  const guest = normalizeGuest((params.get('guest') ?? '').replace(/[\u0000-\u001f\u007f-\u009f]/gu, '')).slice(0, 120);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]', root.current!).forEach((element) => {
        gsap.from(element, { y: 26, opacity: 0, duration: .9, ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
      });
    }, root);
    return () => media.revert();
  }, []);
  return <div ref={root}>
    <a className="skip-link" href="#details">Skip to wedding details</a>
    <header className="site-header">
      <a className="brand" href="#invitation" aria-label="Naaz and Hassan home">N<span>&</span>H</a>
      <span className="header-date">KARACHI · 04.11.2026</span>
      <nav aria-label="Main navigation"><a className="nav-detail" href="#details">The evening</a><a className="nav-rsvp" href="#rsvp">Kindly RSVP <Arrow /></a></nav>
    </header>
    <main>
      <Hero guest={guest} />
      <section id="details" className="couple-section section-pad">
        <div className="section-kicker" data-reveal><span>01</span> TWO HEARTS, ONE BEAUTIFUL BEGINNING</div>
        <p className="bismillah" lang="ar" dir="rtl" data-reveal>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p className="intro-copy" data-reveal>With the blessings of Allah and the love of our families,<br className="hidden sm:block" /> we request the honour of your presence at our wedding.</p>
        <div className="couple-names" data-reveal>
          <div><p className="eyebrow">THE BRIDE</p><h2>{wedding.bride}</h2><p>{wedding.brideFamily}</p></div>
          <span className="couple-amp">&</span>
          <div><p className="eyebrow">THE GROOM</p><h2>{wedding.groom}</h2><p>{wedding.groomFamily}</p></div>
        </div>
        <Flower className="section-flower" />
        <p className="blessing" data-reveal>“A new chapter, written together.”</p>
      </section>
      <section id="evening" className="evening-section section-pad">
        <div className="evening-top" data-reveal>
          <div><p className="section-kicker"><span>02</span> THE CELEBRATION</p><h2>An evening<br />to <em>remember.</em></h2></div>
          <div className="date-block"><span>04</span><div>NOVEMBER 2026<p>Wednesday · Karachi time</p></div></div>
        </div>
        <div className="schedule">{wedding.schedule.map((event) => <article key={event.name} data-reveal>
          <span className="schedule-number">{event.number}</span><p className="schedule-time">{event.time}</p><h3>{event.name}</h3><p>{event.note}</p>
        </article>)}</div>
        <div className="calendar-row" data-reveal><span>A little reminder for a very special day.</span>
          <div className="flex flex-wrap gap-5"><a className="text-link" href="/api/calendar" download>Add to calendar <Arrow /></a><a className="text-link" href={googleCalendarURL} target="_blank" rel="noopener noreferrer">Google Calendar <Arrow /></a></div>
        </div>
      </section>
      <section id="venue" className="venue-section section-pad">
        <div className="venue-copy" data-reveal><p className="section-kicker"><span>03</span> MEET US HERE</p><h2>A place for<br /><em>beautiful memories.</em></h2>
          <h3>{wedding.venue}</h3><address>{wedding.address}</address><a className="button button-outline" href={mapsURL} target="_blank" rel="noopener noreferrer">Get directions <Arrow /></a>
        </div>
        <div className="map-wrap" data-reveal><iframe title="Crystal Banquet location on Google Maps" src={mapsEmbedURL} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /><a className="map-caption" href={mapsURL} target="_blank" rel="noopener noreferrer"><span>CRYSTAL BANQUET · KARACHI</span><Arrow /></a></div>
      </section>
      <section id="rsvp" className="rsvp-section section-pad">
        <div className="rsvp-copy" data-reveal><p className="section-kicker"><span>04</span> WITH LOVE, WE INVITE YOU</p><h2>It wouldn’t be<br />the same <em>without you.</em></h2><p>Your presence will make our celebration all the more special.<br />Please let us know if you can join us.</p><Flower className="rsvp-flower" /></div>
        <RSVPForm key={guest} guest={guest} />
      </section>
    </main>
    <MusicToggle />
    <footer><span className="footer-monogram">N & H</span><p>With love, Naaz & Hassan</p><span>04 NOVEMBER 2026 · KARACHI</span><a href="#invitation">Back to the beginning ↑</a><small className="music-credit">Music: <a href="https://freemusicarchive.org/music/musical-meanderings/organic-oddities/slightly-shehnai/" target="_blank" rel="noopener noreferrer">“Slightly Shehnai”</a> by Musical Meanderings (Julian Overall), <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC 4.0</a></small></footer>
  </div>;
}
