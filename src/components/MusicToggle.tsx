'use client';
import { useEffect, useRef, useState } from 'react';
import { SoundOff, SoundOn } from './Icons';

const SRC = '/music/background.mp3';
const MUTED_KEY = 'invitation-music-muted';

/** Browsers block sound until the guest interacts, so music starts on the first tap/click/key press. */
export default function MusicToggle() {
  const audio = useRef<HTMLAudioElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [available, setAvailable] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (audio.current?.error) { setAvailable(false); return; } // load failed before hydration
    let muted = false;
    try { muted = localStorage.getItem(MUTED_KEY) === '1'; } catch {}
    if (muted) return;
    const start = (event: Event) => {
      if (button.current?.contains(event.target as Node)) return; // the button handles its own click
      audio.current?.play().catch(() => {});
      remove();
    };
    const remove = () => ['pointerdown', 'keydown'].forEach((type) => window.removeEventListener(type, start));
    ['pointerdown', 'keydown'].forEach((type) => window.addEventListener(type, start));
    return remove;
  }, []);

  useEffect(() => {
    // Pause while the tab is hidden; resume only if it was playing.
    let resume = false;
    const onVisibility = () => {
      const el = audio.current;
      if (!el) return;
      if (document.hidden) { resume = !el.paused; el.pause(); }
      else if (resume) el.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
      try { localStorage.removeItem(MUTED_KEY); } catch {}
    } else {
      el.pause();
      try { localStorage.setItem(MUTED_KEY, '1'); } catch {}
    }
  };

  return <>
    <audio ref={audio} src={SRC} loop preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onLoadedMetadata={(e) => { e.currentTarget.volume = 0.45; }} onError={() => setAvailable(false)} />
    {available && <button ref={button} type="button" className={`music-toggle ${playing ? 'is-playing' : ''}`} onClick={toggle}
      aria-pressed={playing} aria-label={playing ? 'Mute background music' : 'Play background music'}>
      {playing ? <SoundOn /> : <SoundOff />}
    </button>}
  </>;
}
