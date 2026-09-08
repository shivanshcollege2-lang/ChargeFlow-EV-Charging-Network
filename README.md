# ChargeFlow – EV Charging Network

ChargeFlow is a full-stack EV charging network application created as a practical training project. It covers station discovery, availability, booking, charging-session tracking, notifications and JWT-based driver authentication.

## Run locally

Requirements: Node.js 18+.

```bash
npm install
npm start
```

Open: `http://localhost:5000`

No XAMPP or database server is required for this demo build. Data is persisted in `data/db.json` so the application can be downloaded and run immediately.

## Main flow

Home → Find Station → Register/Login → Book a slot → Dashboard → Start charging → Complete session → Review energy/cost

## API endpoints

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/stations`
- GET `/api/stations/:id`
- POST `/api/bookings`
- PATCH `/api/bookings/:id/cancel`
- POST `/api/sessions/start`
- PATCH `/api/sessions/:id/complete`
- GET `/api/dashboard`
- PATCH `/api/notifications/:id/read`

## Notes

The local build intentionally uses JSON persistence so it runs without external database setup. For a production deployment, the persistence layer can be replaced with the planned MySQL schema while retaining the REST/API and authentication layers.
