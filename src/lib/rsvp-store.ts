import { mkdir, open, readFile, rename, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import lockfile from 'proper-lockfile';
import { parseRSVP, type RSVPInput } from './rsvp-validation';
export type RSVPRecord = RSVPInput & { id: string; submittedAt: string };

/** Append-only; repeated names never silently overwrite another guest.
 * Requires one persistent local filesystem shared by all local Node workers.
 */
export async function appendRSVP(input: RSVPInput, directory?: string): Promise<RSVPRecord> {
  const valid = parseRSVP(input);
  const dir = resolve(directory ?? process.env.RSVP_DATA_DIR ?? join(process.cwd(), 'data'));
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const filename = join(dir, 'rsvps.json');
  let compromised: Error | undefined;
  const release = await lockfile.lock(filename, {
    realpath: false, stale: 30_000, update: 5_000,
    retries: { retries: 16, factor: 1.3, minTimeout: 30, maxTimeout: 400, randomize: true },
    onCompromised: (error) => { compromised = error; },
  });
  const temp = join(dir, `.rsvps-${randomUUID()}.tmp`);
  try {
    let records: unknown = [];
    try { records = JSON.parse(await readFile(filename, 'utf8')); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    if (!Array.isArray(records)) throw new Error('RSVP file is not an array; refusing to replace it.');
    for (const record of records) {
      parseRSVP(record);
      if (typeof record.id !== 'string' || typeof record.submittedAt !== 'string') throw new Error('Invalid existing RSVP record.');
    }
    const record: RSVPRecord = { ...valid, id: randomUUID(), submittedAt: new Date().toISOString() };
    records.push(record);
    const handle = await open(temp, 'wx', 0o600);
    try { await handle.writeFile(`${JSON.stringify(records, null, 2)}\n`, 'utf8'); await handle.sync(); }
    finally { await handle.close(); }
    if (compromised) throw compromised;
    // Same-directory atomic replacement keeps readers from seeing partial JSON.
    await rename(temp, filename);
    return record;
  } finally {
    await unlink(temp).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') console.error('RSVP temp cleanup failed:', error.code);
    });
    await release();
  }
}

/** Read-only view for the hosts' guest list. Missing file means no responses yet. */
export async function readRSVPs(directory?: string): Promise<RSVPRecord[]> {
  const dir = resolve(directory ?? process.env.RSVP_DATA_DIR ?? join(process.cwd(), 'data'));
  let records: unknown;
  try { records = JSON.parse(await readFile(join(dir, 'rsvps.json'), 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
  if (!Array.isArray(records)) throw new Error('RSVP file is not an array.');
  return records.map((record) => {
    const valid = parseRSVP(record);
    if (typeof record.id !== 'string' || typeof record.submittedAt !== 'string') throw new Error('Invalid existing RSVP record.');
    return { ...valid, id: record.id, submittedAt: record.submittedAt };
  });
}

/** Latest response per name (case-insensitive), since corrections are appended as new entries. */
export function latestByGuest(records: RSVPRecord[]): (RSVPRecord & { responses: number })[] {
  const latest = new Map<string, RSVPRecord & { responses: number }>();
  for (const record of records) {
    const key = record.guestName.toLocaleLowerCase();
    const previous = latest.get(key);
    const responses = (previous?.responses ?? 0) + 1;
    latest.set(key, !previous || record.submittedAt >= previous.submittedAt ? { ...record, responses } : { ...previous, responses });
  }
  return [...latest.values()].sort((a, b) => a.status.localeCompare(b.status) || a.guestName.localeCompare(b.guestName));
}
