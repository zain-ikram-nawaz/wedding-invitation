import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { adminPassword, isValidSession, SESSION_COOKIE } from '@/lib/admin-auth';
import { latestByGuest, readRSVPs } from '@/lib/rsvp-store';
import { login, logout } from './actions';
export const metadata: Metadata = { title: 'Guest list · Naaz & Hassan', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const when = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default async function GuestsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!adminPassword()) {
    return <main className="guests-page"><div className="guests-login"><p className="eyebrow">GUEST LIST</p><h1>Not set up yet</h1>
      <p className="guests-note">Add <code>ADMIN_PASSWORD=your-password</code> to <code>.env.local</code> and restart the server.</p></div></main>;
  }
  if (!isValidSession((await cookies()).get(SESSION_COOKIE)?.value)) {
    const { error } = await searchParams;
    return <main className="guests-page"><form className="guests-login" action={login}>
      <p className="eyebrow">FOR THE HOSTS</p><h1>Guest list</h1>
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
      {error && <p className="form-message" role="alert">That password is not correct.</p>}
      <button className="button button-dark w-full justify-between" type="submit">Open guest list</button>
    </form></main>;
  }

  let guests: ReturnType<typeof latestByGuest>;
  try { guests = latestByGuest(await readRSVPs()); }
  catch {
    return <main className="guests-page"><div className="guests-login"><h1>Could not read responses</h1>
      <p className="guests-note">The RSVP file could not be read. Check <code>data/rsvps.json</code> on the server.</p></div></main>;
  }
  const attending = guests.filter((g) => g.status === 'Attending').length;
  return <main className="guests-page">
    <header className="guests-head">
      <div><p className="eyebrow">NAAZ &amp; HASSAN · 4 NOVEMBER 2026</p><h1>Guest list</h1></div>
      <form action={logout}><button className="text-link" type="submit">Sign out</button></form>
    </header>
    <section className="guests-stats" aria-label="Totals">
      <div><strong>{attending}</strong><span>Attending</span></div>
      <div><strong>{guests.length - attending}</strong><span>Not attending</span></div>
      <div><strong>{guests.length}</strong><span>Total responses</span></div>
    </section>
    {guests.length === 0 ? <p className="guests-note">No responses yet.</p> :
      <div className="guests-table-wrap"><table className="guests-table">
        <thead><tr><th>#</th><th>Guest</th><th>Response</th><th>Last updated (PKT)</th></tr></thead>
        <tbody>{guests.map((g, i) => <tr key={g.id}>
          <td>{i + 1}</td>
          <td>{g.guestName}{g.responses > 1 && <small> · changed {g.responses - 1}×</small>}</td>
          <td><span className={`guest-status ${g.status === 'Attending' ? 'yes' : 'no'}`}>{g.status}</span></td>
          <td>{when.format(new Date(g.submittedAt))}</td>
        </tr>)}</tbody>
      </table></div>}
    <p className="guests-note">Each guest is shown once with their latest answer. Names are matched ignoring capital letters.</p>
  </main>;
}
