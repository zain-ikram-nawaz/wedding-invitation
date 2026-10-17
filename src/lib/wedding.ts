export const wedding = {
  bride: 'Noor-e-Chashmi Naaz Gul', brideFamily: 'bint Muhammad Mehboob',
  groom: 'Muhammad Hassan Sarmad', groomFamily: 'wald Fayyaz Hussain',
  date: '4 November 2026', day: 'Wednesday', venue: 'Crystal Banquet',
  address: 'Plot No. 05-C, Block 10, F.B Area, Karachi', timezone: 'Asia/Karachi',
  // UTC+05:00. Calendar ends at 11:30 PM, an assumed end after Rukhsati.
  startUTC: '20261104T160000Z', endUTC: '20261104T183000Z',
  schedule: [
    { name: 'Barat', time: '9:00 PM', note: 'A joyful arrival. A beautiful beginning.', number: '01' },
    { name: 'Khana', time: '10:00 PM', note: 'Good food, warm company, shared happiness.', number: '02' },
    { name: 'Rukhsati', time: '11:00 PM', note: 'Your prayers for the journey ahead.', number: '03' },
  ],
} as const;
export const mapsQuery = `${wedding.venue}, ${wedding.address}`;
export const mapsURL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
export const mapsEmbedURL = `https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`;
export const googleCalendarURL = `https://calendar.google.com/calendar/render?${new URLSearchParams({
  action: 'TEMPLATE', text: `${wedding.bride} & ${wedding.groom} — Wedding`,
  dates: `${wedding.startUTC}/${wedding.endUTC}`, ctz: wedding.timezone, location: mapsQuery,
  details: 'Barat: 9:00 PM · Khana: 10:00 PM · Rukhsati: 11:00 PM. All times in Karachi (PKT).',
})}`;
