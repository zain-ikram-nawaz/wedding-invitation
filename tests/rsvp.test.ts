import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { appendRSVP, latestByGuest, readRSVPs } from '../src/lib/rsvp-store';
import { parseRSVP } from '../src/lib/rsvp-validation';
import { createCalendar } from '../src/lib/calendar';

test('24 concurrent submissions survive without lost updates', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wedding-rsvp-test-'));
  try {
    await Promise.all(Array.from({ length: 24 }, (_, i) => appendRSVP({ guestName: `Guest ${i}`, status: i % 2 ? 'Attending' : 'Not Attending' }, dir)));
    const records = JSON.parse(await readFile(join(dir, 'rsvps.json'), 'utf8'));
    assert.equal(records.length, 24);
    assert.equal(new Set(records.map((r: { guestName: string }) => r.guestName)).size, 24);
    assert.equal(new Set(records.map((r: { id: string }) => r.id)).size, 24);
  } finally { await rm(dir, { recursive: true }); }
});
test('corrupt data is preserved and rejects new writes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wedding-rsvp-test-'));
  try {
    await writeFile(join(dir, 'rsvps.json'), '{damaged');
    await assert.rejects(appendRSVP({ guestName: 'Muhammad Ikram', status: 'Attending' }, dir));
    assert.equal(await readFile(join(dir, 'rsvps.json'), 'utf8'), '{damaged');
  } finally { await rm(dir, { recursive: true }); }
});
test('repeated names append independently and Unicode names are accepted', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wedding-rsvp-test-'));
  try {
    await appendRSVP({ guestName: 'محمد اکرام', status: 'Attending' }, dir);
    await appendRSVP({ guestName: 'محمد اکرام', status: 'Not Attending' }, dir);
    const records = JSON.parse(await readFile(join(dir, 'rsvps.json'), 'utf8'));
    assert.equal(records.length, 2);
    assert.equal(records[1].status, 'Not Attending');
  } finally { await rm(dir, { recursive: true }); }
});
test('server input rejects malformed status, long names, empty names and controls', () => {
  assert.deepEqual(parseRSVP({ guestName: '  Muhammad   Ikram  ', status: 'Attending' }), { guestName: 'Muhammad Ikram', status: 'Attending' });
  for (const input of [null, [], { guestName: 'A', status: 'Attending' }, { guestName: '  ', status: 'Attending' }, { guestName: 'a'.repeat(121), status: 'Attending' }, { guestName: 'Guest', status: 'Maybe' }, { guestName: 'Bad\u0000Name', status: 'Attending' }]) assert.throws(() => parseRSVP(input));
});
test('calendar uses Karachi evening UTC times and RFC folding', () => {
  const ics = createCalendar(new Date('2026-10-17T00:00:00Z'));
  assert.match(ics, /DTSTART:20261104T160000Z/);
  assert.match(ics, /DTEND:20261104T183000Z/);
  assert.match(ics, /DTSTAMP:20261017T000000Z/);
  assert.match(ics, /\\nKhana: 10:00 PM/);
  assert.ok(ics.endsWith('\r\n'));
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75);
});
test('guest list keeps the latest answer per name and tolerates a missing file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wedding-rsvp-test-'));
  try {
    assert.deepEqual(await readRSVPs(dir), []);
    await appendRSVP({ guestName: 'Zain Ikram', status: 'Attending' }, dir);
    await new Promise((done) => setTimeout(done, 5));
    await appendRSVP({ guestName: 'zain ikram', status: 'Not Attending' }, dir);
    await appendRSVP({ guestName: 'Aftab Ikram', status: 'Attending' }, dir);
    const guests = latestByGuest(await readRSVPs(dir));
    assert.equal(guests.length, 2);
    const zain = guests.find((g) => g.guestName.toLowerCase() === 'zain ikram');
    assert.equal(zain?.status, 'Not Attending');
    assert.equal(zain?.responses, 2);
  } finally { await rm(dir, { recursive: true }); }
});
