import { createCalendar } from '@/lib/calendar';
export const runtime = 'nodejs';
export async function GET() {
  return new Response(createCalendar(), { headers: {
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': 'attachment; filename="naaz-and-hassan.ics"', 'Cache-Control': 'no-store',
  } });
}
