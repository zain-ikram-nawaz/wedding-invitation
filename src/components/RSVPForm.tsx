'use client';
import { useRef, useState, type FormEvent } from 'react';
import { parseRSVP, type RSVPStatus } from '@/lib/rsvp-validation';
import { Arrow } from './Icons';
export default function RSVPForm({ guest }: { guest: string }) {
  const [name, setName] = useState(guest);
  const [status, setStatus] = useState<RSVPStatus | ''>('');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const submitting = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    try {
      const input = parseRSVP({ guestName: name, status });
      submitting.current = true;
      setState('saving'); setMessage('');
      const response = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      setState('saved');
      setMessage(input.status === 'Attending' ? 'We can’t wait to celebrate with you.' : 'You’ll be missed. Thank you for letting us know.');
    } catch (error) { setState('error'); setMessage(error instanceof Error ? error.message : 'Please try again.'); }
    finally { submitting.current = false; }
  }
  return <div className="rsvp-card" data-reveal>
    {state === 'saved' ? <div className="rsvp-success" role="status"><span className="success-mark">✓</span><p className="eyebrow">RESPONSE RECEIVED</p><h3>Thank you, {name.trim()}.</h3><p>{message}</p><button className="text-link" type="button" onClick={() => { setState('idle'); setMessage(''); }}>Send an updated response <Arrow /></button></div> :
      <form onSubmit={submit} aria-busy={state === 'saving'}>
        <p className="eyebrow">A SEAT, A SMILE, A SHARED MEMORY</p><h3>Will you join us?</h3>
        <label htmlFor="guest-name">Your name</label><input id="guest-name" name="guestName" autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" disabled={state === 'saving'} />
        <fieldset disabled={state === 'saving'}><legend>Your response</legend><div className="rsvp-options">{(['Attending', 'Not Attending'] as const).map((value) => <label key={value} className={`rsvp-option ${status === value ? 'selected' : ''}`}><input type="radio" name="status" value={value} checked={status === value} onChange={() => setStatus(value)} required /><span>{value === 'Attending' ? 'Joyfully attending' : 'Unable to attend'}</span></label>)}</div></fieldset>
        <p className="form-message" role={state === 'error' ? 'alert' : 'status'}>{message}</p>
        <button className="button button-dark w-full justify-between" disabled={state === 'saving'} type="submit">{state === 'saving' ? 'Sending your response…' : 'Send my RSVP'}<Arrow /></button>
        <p className="privacy-note">Your response is shared only with the hosts.</p>
      </form>}
  </div>;
}
