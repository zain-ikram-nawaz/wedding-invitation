export const statuses = ['Attending', 'Not Attending'] as const;
export type RSVPStatus = typeof statuses[number];
export type RSVPInput = { guestName: string; status: RSVPStatus };
export function normalizeGuest(value: string): string {
  return value.normalize('NFC').replace(/\s+/gu, ' ').trim();
}
export function parseRSVP(value: unknown): RSVPInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid form data.');
  const input = value as Record<string, unknown>;
  if (typeof input.guestName !== 'string' || typeof input.status !== 'string') {
    throw new Error('Please enter your name and choose a response.');
  }
  if (/[\u0000-\u001f\u007f-\u009f]/u.test(input.guestName)) throw new Error('Please enter a valid name.');
  const guestName = normalizeGuest(input.guestName);
  if (guestName.length < 2 || guestName.length > 120) throw new Error('Your name must be 2–120 characters.');
  if (!(statuses as readonly string[]).includes(input.status)) throw new Error('Please choose Attending or Not Attending.');
  return { guestName, status: input.status as RSVPStatus };
}
