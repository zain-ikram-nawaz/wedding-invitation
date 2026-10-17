import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/rsvp/route';

function request(body: string, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost:3000/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000', ...headers }, body });
}
test('API saves valid data and refuses invalid, oversized and cross-origin payloads', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wedding-api-test-'));
  const oldDir = process.env.RSVP_DATA_DIR;
  const oldOrigin = process.env.APP_ORIGIN;
  process.env.RSVP_DATA_DIR = dir;
  process.env.APP_ORIGIN = 'http://localhost:3000';
  const valid = JSON.stringify({ guestName: 'Muhammad Ikram', status: 'Attending' });
  try {
    assert.equal((await POST(request(valid))).status, 201);
    assert.equal(JSON.parse(await readFile(join(dir, 'rsvps.json'), 'utf8'))[0].guestName, 'Muhammad Ikram');
    assert.equal((await POST(request(valid, { Origin: 'https://other.example' }))).status, 403);
    assert.equal((await POST(request(valid, { 'Content-Type': 'text/plain' }))).status, 415);
    assert.equal((await POST(request('{bad'))).status, 400);
    assert.equal((await POST(request(JSON.stringify({ guestName: 'Guest', status: 'Maybe' })))).status, 400);
    assert.equal((await POST(request('x'.repeat(5000)))).status, 413);
    assert.equal(JSON.parse(await readFile(join(dir, 'rsvps.json'), 'utf8')).length, 1);
  } finally {
    if (oldDir === undefined) delete process.env.RSVP_DATA_DIR; else process.env.RSVP_DATA_DIR = oldDir;
    if (oldOrigin === undefined) delete process.env.APP_ORIGIN; else process.env.APP_ORIGIN = oldOrigin;
    await rm(dir, { recursive: true });
  }
});
