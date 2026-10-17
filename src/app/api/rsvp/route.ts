import { NextRequest, NextResponse } from 'next/server';
import { parseRSVP } from '@/lib/rsvp-validation';
import { appendRSVP } from '@/lib/rsvp-store';
export const runtime = 'nodejs';
const MAX_BYTES = 4096;
const headers = { 'Cache-Control': 'no-store' };
async function readLimitedBody(request: Request): Promise<unknown> {
  if (!request.body) throw new Error('Empty request.');
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); throw new RangeError('Request is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const expected = process.env.APP_ORIGIN || new URL(request.url).origin;
  if ((origin && origin !== expected) || request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ error: 'Please submit from the invitation page.' }, { status: 403, headers });
  }
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    return NextResponse.json({ error: 'Expected JSON.' }, { status: 415, headers });
  }
  if (Number(request.headers.get('content-length')) > MAX_BYTES) {
    return NextResponse.json({ error: 'Request is too large.' }, { status: 413, headers });
  }
  let input;
  try { input = parseRSVP(await readLimitedBody(request)); }
  catch (error) {
    return NextResponse.json({ error: error instanceof SyntaxError ? 'Invalid JSON.' : (error as Error).message },
      { status: error instanceof RangeError ? 413 : 400, headers });
  }
  try {
    const saved = await appendRSVP(input);
    return NextResponse.json({ ok: true, id: saved.id, status: saved.status }, { status: 201, headers });
  } catch (error) {
    console.error('RSVP storage failed:', (error as NodeJS.ErrnoException).code ?? (error as Error).name);
    return NextResponse.json({ error: 'Your response could not be saved. Please try again shortly.' }, { status: 503, headers });
  }
}
