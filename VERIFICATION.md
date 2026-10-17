# Verification

Verified locally on Windows with Node 22.23.3, Next.js 16.4.2 and the resolved versions in package-lock.json.

- Production `next build --webpack`: successful, including TypeScript and static generation.
- Standalone type check: successful.
- Six automated tests: passed (24 concurrent appends, malformed existing file preservation, repeated/Unicode names, input validation, API status codes/origin/body limits, and calendar dates/folding).
- Production HTTP page and calendar route: 200; calendar returned a downloadable `.ics` with 16:00 UTC start (9 PM Karachi).
- Browser: URL guest name appeared in the invitation and prefilled the form; an attending test submission showed confirmation and was verified in the isolated test JSON file.
- Mobile viewport 390 × 844: no horizontal document overflow.
- Browser data was stored under a separate preview directory. The supplied `data/rsvps.json` remains `[]`.

Not verified: a live hosting deployment, the exact venue pin, or real-device GPU performance. The Maps address and calendar's assumed 11:30 PM end time should be reviewed before sending invitations.
