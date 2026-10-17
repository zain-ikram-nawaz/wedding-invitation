import { wedding, mapsQuery } from './wedding';
function escapeICS(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}
// RFC 5545: fold at 75 UTF-8 octets without splitting multibyte characters.
function foldLine(line: string) {
  let result = '', bytes = 0;
  for (const char of line) {
    const size = Buffer.byteLength(char);
    if (bytes + size > 75) { result += '\r\n '; bytes = 1; }
    result += char; bytes += size;
  }
  return result;
}
export function createCalendar(now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Naaz and Hassan//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    'UID:naaz-hassan-20261104@wedding-invitation.local', `DTSTAMP:${stamp}`,
    `DTSTART:${wedding.startUTC}`, `DTEND:${wedding.endUTC}`,
    `SUMMARY:${escapeICS(`${wedding.bride} & ${wedding.groom} — Wedding`)}`,
    `LOCATION:${escapeICS(mapsQuery)}`,
    `DESCRIPTION:${escapeICS('Barat: 9:00 PM\nKhana: 10:00 PM\nRukhsati: 11:00 PM\nAll times: Karachi (UTC+05:00).')}`,
    'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR', '',
  ].map(foldLine).join('\r\n');
}
