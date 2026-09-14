# Krishi Procurement Platform — SIH 2026

**Smarter Procurement. Less Waiting.**

A farmer-focused digital procurement management platform for agricultural
procurement centres, built for Smart India Hackathon 2026.

---

## 1. Project overview

During procurement season a very large number of farmers arrive at a small number of
procurement centres within a few working hours. The result is long physical queues,
unpredictable waiting, crowding at peak hours, and repeated follow-ups about payment.

**Krishi Procurement Platform** lets a farmer:

- **discover procurement centres** — search and filter by district and state
- **view available slots** — date, time and remaining capacity for each centre
- **book a procurement appointment** — one slot, one booking reference
- **track and cancel bookings** — see every booking and its current status

…and gives procurement centre staff an operational console to manage centres, publish
and close slots, and review every booking.

### Incremental development

The project is built in three deliberate stages:

| Part | Scope | Status |
| --- | --- | --- |
| **Part 1** | Frontend foundation — React SPA, routing, components, all screens | ✅ Complete |
| **Part 2** | Backend, database and authentication — Express REST API, MongoDB, JWT | ✅ Complete |
| **Part 3** | Real-time queue and advanced operations | 🚧 Planned |

---

## 2. Current features

### ✅ Implemented (Part 1 + Part 2)

**Authentication & authorization**
- Farmer registration (server-side validated, bcrypt-hashed passwords)
- Farmer login (mobile number or email + password)
- Admin login (separate portal; admins are created by the seed script, not self-registration)
- JWT authentication — signed tokens, sent as `Authorization: Bearer <token>`
- Role-based authorization (`FARMER` / `ADMIN`) enforced by Express middleware
- Live role re-check on every request, so deactivating an account takes effect immediately

**Procurement centres**
- Centre listing with search, district, state and status filters
- Centre details, including a live slot-availability summary
- Admin centre management: create, update
- Soft activation/deactivation — centres are **never** physically deleted

**Slots**
- Slot listing per centre, filterable by date and status
- Admin slot management: create, update, change status (Active / Full / Closed)
- Slot activation/deactivation
- Duplicate start-times per centre/date rejected
- Capacity cannot be reduced below the seats already booked

**Bookings**
- Slot booking with a generated booking reference (`KP-2026-1001`)
- Persistent bookings stored in MongoDB
- "My bookings" listing and booking details
- Booking cancellation, which restores slot availability
- **Capacity validation** — a slot can never exceed `maxBookings`
- **Concurrency-safe booking** — atomic seat reservation (see §12)
- One active booking per farmer per slot, enforced by a partial unique index

**Admin**
- Dashboard statistics (centres, today's slots, today's bookings, registered farmers)
- All-bookings view with centre / status / date / text filters
- Centre-specific bookings view

**Platform**
- MongoDB persistence via Mongoose
- REST API with a consistent `{ success, data }` / `{ success, message, errors }` envelope
- Input validation on every write endpoint (express-validator)
- Centralised API error handling (validation, cast, duplicate-key, auth, 404)
- Security middleware: helmet, CORS allow-list, rate limiting on auth routes
- Loading / empty / error / success states on every data-driven screen
- Responsive, mobile-first, accessible UI

### 🚧 Planned for Part 3 — NOT implemented

These are **not built**. The UI reserves labelled space for them and never displays
simulated live data.

- Real-time queue tracking
- Farmer check-in at the centre
- Live queue position
- ETA / estimated waiting time calculation
- Counter management
- Real-time notifications
- Procurement progress tracking
- Payment / procurement status
- Advanced analytics
- AI-powered predictions and arrival recommendations

> The booking statuses `CHECKED_IN`, `WAITING`, `PROCESSING`, `PROCUREMENT_COMPLETED`,
> `PAYMENT_PENDING` and `PAYMENT_COMPLETED` exist in the database enum and the UI can
> render them, but **no code path transitions a booking into them yet.** Only
> `CONFIRMED` and `CANCELLED` are reachable today.

---

## 3. Tech stack

### Frontend
- **React 19**
- **Vite 8** (build tool + dev server with API proxy)
- **React Router 7** (client-side routing)
- **Axios** (single configured instance + interceptors)
- **Tailwind CSS 4** (via `@tailwindcss/vite`)

No third-party component library is used — the UI components in
`client/src/components/ui/` are written for this project.

### Backend
- **Node.js** (ES modules)
- **Express 4** — REST API
- **express-validator** — request validation
- **helmet**, **cors**, **express-rate-limit** — security middleware
- **morgan** — request logging (development)

### Database
- **MongoDB Atlas**
- **Mongoose 8** — schemas, indexes, partial unique indexes

### Authentication
- **jsonwebtoken** (JWT)
- **bcryptjs** — password hashing (10 salt rounds)

---

## 4. Architecture

```text
React + Vite Frontend
        |
        | REST API (Axios, JWT bearer token)
        ↓
Node.js + Express Backend
        |
        | Mongoose
        ↓
MongoDB Atlas
```

**Frontend (`client/`)** — renders the farmer and admin interfaces and holds session
state. All HTTP access is funnelled through `src/services/`; no component calls Axios
directly. Route guards here are navigation UX only.

**Backend (`server/`)** — the security and correctness boundary. Verifies JWTs, enforces
role-based authorization, validates every input, and owns all business rules (slot
capacity, booking uniqueness, soft deactivation). Nothing the browser sends is trusted.

**Database (MongoDB Atlas)** — persistent storage. Schema shape, relationships and
uniqueness constraints are enforced by Mongoose schemas and MongoDB indexes.

---

## 5. Project structure

```text
krishi-procurement/
├── client/                       React + Vite frontend
│   ├── index.html
│   ├── vite.config.js            build config + /api dev proxy
│   ├── package.json
│   ├── .env.example
│   ├── public/                   favicon
│   └── src/
│       ├── components/
│       │   ├── ui/               Button, Input, Select, Card, Modal, Table,
│       │   │                     StatusBadge, LoadingSpinner, EmptyState,
│       │   │                     ErrorState, Alert, PageHeader, ConfirmationDialog
│       │   ├── layout/           Navbar, Sidebar, Footer
│       │   ├── common/           DataState, FuturePhaseNotice, AuthCard
│       │   ├── centres/          CentreCard, CentreFilters
│       │   ├── slots/            SlotCard
│       │   └── bookings/         BookingCard, BookingsTable
│       ├── layouts/              PublicLayout, FarmerLayout, AdminLayout
│       ├── pages/
│       │   ├── auth/             registration + farmer/admin logins
│       │   ├── farmer/           dashboard, centres, slots, bookings
│       │   └── admin/            dashboard, centres, slots, bookings
│       ├── context/              AuthContext, ToastContext
│       ├── hooks/                useAuth, useAsync, useDocumentTitle
│       ├── services/             api.js (Axios) + auth/centre/slot/booking services
│       ├── routes/               AppRoutes, ProtectedRoute, paths
│       ├── utils/                constants, validators, format, storage
│       ├── data/mock/            offline fallback only (see §13)
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── server/                       Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/               env.js (config + validation), db.js (Mongoose)
│   │   ├── controllers/          auth, centre, slot, booking, admin
│   │   ├── middleware/           auth (protect/authorize), validate, errorHandler
│   │   ├── models/               User, Centre, Slot, Booking, Counter
│   │   ├── routes/               index, authRoutes, centreRoutes,
│   │   │                         bookingRoutes, adminRoutes
│   │   ├── services/             bookingService (atomic booking), statsService
│   │   ├── seed/                 seed.js (CLI), seedCore.js, seedData.js
│   │   ├── tests/                api.test.js, setupEnv.js
│   │   ├── utils/                ApiError, asyncHandler, response, token
│   │   ├── app.js                Express app assembly
│   │   └── server.js             entry point
│   ├── .env.example
│   └── package.json
│
├── scripts/
│   ├── build-client.mjs          builds client/ into public/
│   └── start-preview.mjs         runs API + web host together (sandbox preview)
│
├── src/app/                      sandbox preview host only (see §14)
├── README.md
└── .gitignore
```

---

## 6. Setup instructions

### Prerequisites

| Software | Version |
| --- | --- |
| Node.js | 20.x or newer |
| npm | 10.x or newer |
| MongoDB Atlas account | free M0 tier is enough |

### Clone and install

```bash
git clone <repository-url>
cd krishi-procurement
```

Install the two applications separately:

```bash
cd client && npm install
cd ../server && npm install
```

### Backend

```bash
cd server
cp .env.example .env      # then edit .env (see §7)
npm run dev               # http://localhost:5000/api
```

Other backend scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with nodemon (auto-restart) |
| `npm start` | Start the API without nodemon |
| `npm run seed` | Populate the database with demo data |
| `npm run seed -- --fresh` | Wipe the collections, then populate |
| `npm run test:api` | Run the automated API test suite |

### Frontend

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

Other frontend scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server (proxies `/api` → `http://localhost:5000`) |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |

The Vite dev server proxies `/api` to the backend, so the browser sees a single origin
and no client `.env` file is required for local development.

**Run the backend first, then the frontend.**

---

## 7. Environment variables

### `server/.env`

Copy `server/.env.example` → `server/.env` and fill in real values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/krishi_procurement?retryWrites=true&w=majority
JWT_SECRET=a_long_random_secret_at_least_16_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
USE_IN_MEMORY_DB=false
```

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | no (default `5000`) | Port the Express API listens on |
| `NODE_ENV` | no (default `development`) | `development` or `production` |
| `MONGODB_URI` | **yes** | MongoDB Atlas connection string |
| `JWT_SECRET` | **yes** | Secret used to sign JWTs; minimum 16 characters |
| `JWT_EXPIRES_IN` | no (default `7d`) | Token lifetime (`7d`, `12h`, `30m`) |
| `CLIENT_URL` | no (default `http://localhost:5173`) | Origin added to the CORS allow-list |
| `USE_IN_MEMORY_DB` | no (default `false`) | Dev only: start a temporary in-memory MongoDB instead of connecting to Atlas. Data is lost on shutdown. Rejected when `NODE_ENV=production`. |

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The server validates this configuration on boot and **exits with a clear message** if
`JWT_SECRET` or `MONGODB_URI` is missing.

### `client/.env` (optional)

```env
VITE_API_BASE_URL=/api
VITE_USE_MOCK_API=false
```

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | API base URL. The default relative path works with the Vite proxy. |
| `VITE_USE_MOCK_API` | `false` | `true` re-enables the offline mock layer (see §13) |

### ⚠️ Never commit `.env`

`server/.env` and `client/.env` contain secrets and are listed in `.gitignore`.
Commit only the `.env.example` templates.

---

## 8. Database setup

1. **Create a MongoDB Atlas cluster**
   Sign in at [cloud.mongodb.com](https://cloud.mongodb.com) and create a free **M0** cluster.

2. **Create a database user and allow your IP**
   *Database Access* → add a user with a password.
   *Network Access* → add your IP address (or `0.0.0.0/0` for development only).

3. **Get the connection string**
   *Cluster* → **Connect** → **Drivers** → copy the `mongodb+srv://…` string.
   Replace `<password>` and insert the database name, e.g. `…mongodb.net/krishi_procurement?retryWrites=true&w=majority`.

4. **Put it into `server/.env`** as `MONGODB_URI`.

5. **Start the backend** — Mongoose creates the collections and indexes automatically:
   ```bash
   cd server
   npm run dev
   ```

6. **Seed demo data** (optional but recommended):
   ```bash
   cd server
   npm run seed
   ```

   The seed is **idempotent** — running it twice creates nothing new. To reset
   completely:

   ```bash
   npm run seed -- --fresh
   ```

   `npm run seed` creates: 3 accounts, 8 procurement centres, 170 slots across the next
   5 days, and 1 sample booking.

> `npm run seed` refuses to run when `USE_IN_MEMORY_DB=true`, because seeding a
> throwaway database has no effect.

---

## 9. Development / demo credentials

These accounts are created by `npm run seed`.

```text
Admin
Phone:    9999999999
Email:    admin@krishi.gov.in
Password: Admin@123

Farmer
Phone:    9876543210
Password: Farmer@123

Farmer
Phone:    9812345678
Password: Farmer@123
```

- The admin signs in at `/admin/login` using the **email**; farmers sign in at
  `/farmer/login` using their **mobile number**.
- Farmers can also self-register at `/farmer/register`.
- Admin accounts cannot be created through the UI — only by the seed script or directly
  in the database.

> ⚠️ **These are development/demo credentials only.** They are published in this
> repository and must never be used in production. Change or remove them before any
> real deployment.

---

## 10. API documentation

Base URL: `http://localhost:5000/api`

All responses use a consistent envelope:

```jsonc
// success
{ "success": true, "data": { /* ... */ } }

// error
{ "success": false, "message": "Human readable message", "errors": { "field": "..." } }
```

Authenticated requests must send `Authorization: Bearer <jwt>`.

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/api/health` | Public | API + database health |
| POST | `/api/auth/register` | Public | Register a farmer |
| POST | `/api/auth/login` | Public | Login (farmer or admin) |
| GET | `/api/auth/me` | User | Current user |
| GET | `/api/centres` | Public | List centres (`?search&district&state&status`) |
| GET | `/api/centres/:id` | Public | Centre details + slot summary |
| GET | `/api/centres/:centreId/slots` | Public | List slots (`?date&status`) |
| POST | `/api/bookings` | Farmer | Create booking (`{ centreId, slotId }`) |
| GET | `/api/bookings/my` | Farmer | My bookings |
| GET | `/api/bookings/:id` | Farmer | Booking details (own only) |
| PATCH | `/api/bookings/:id/cancel` | Farmer | Cancel booking |
| POST | `/api/admin/centres` | Admin | Create centre |
| PUT | `/api/admin/centres/:id` | Admin | Update centre |
| PATCH | `/api/admin/centres/:id/status` | Admin | Activate / soft-deactivate centre |
| POST | `/api/admin/centres/:centreId/slots` | Admin | Create slot |
| PUT | `/api/admin/slots/:id` | Admin | Update slot |
| PATCH | `/api/admin/slots/:id/status` | Admin | Change slot status |
| GET | `/api/admin/bookings` | Admin | All bookings (`?centreId&status&date&search`) |
| GET | `/api/admin/centres/:centreId/bookings` | Admin | Bookings for one centre |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |

### Status codes

| Code | Meaning |
| --- | --- |
| `200` / `201` | Success |
| `400` | Validation failure — `errors` maps field → message |
| `401` | Missing, invalid or expired token; bad credentials |
| `403` | Authenticated but wrong role, or accessing another farmer's data |
| `404` | Resource not found |
| `409` | Conflict — duplicate account, slot full, slot closed, already cancelled |
| `429` | Too many auth attempts (rate limited) |
| `500` | Unexpected server error |

### Example

```bash
# login
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"9876543210","password":"Farmer@123","role":"FARMER"}'

# book a slot
curl -X POST http://localhost:5000/api/bookings \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"centreId":"<centreId>","slotId":"<slotId>"}'
```

---

## 11. Authentication flow

```text
Register/Login
      ↓
Backend verifies credentials  (bcrypt compare)
      ↓
JWT generated                 (signed with JWT_SECRET, expires in JWT_EXPIRES_IN)
      ↓
Frontend stores session/token (localStorage, key "krishi.session")
      ↓
JWT sent with protected requests  (Authorization: Bearer <token>, Axios interceptor)
      ↓
Backend verifies JWT          (protect middleware, user re-loaded from MongoDB)
      ↓
Role-based authorization      (authorize('ADMIN') / authorize('FARMER'))
```

**Authorization is enforced by the backend and cannot be bypassed by changing frontend
state.** The React `ProtectedRoute` component only decides which screen to show; it is a
navigation convenience. Every protected endpoint independently verifies the token and
re-reads the user's role from the database, so editing `localStorage` or React state in
the browser grants no access to data. This is verified by tests — a farmer's token
returns `403` on every admin route.

Additional hardening:
- Passwords are hashed with bcrypt and the hash is never returned by the API
  (`select: false` on the field plus a `toJSON` transform).
- Login responds identically whether or not the account exists, so the endpoint cannot
  be used to discover registered mobile numbers.
- Auth routes are rate limited to 40 requests per 15 minutes per IP.

---

## 12. Booking logic — capacity protection

Slot capacity is enforced by a **single atomic MongoDB operation**, not by a
read-then-write sequence (which would race):

```js
Slot.findOneAndUpdate(
  {
    _id: slotId,
    status: 'ACTIVE',
    $expr: { $lt: ['$bookedCount', '$maxBookings'] },   // capacity check
  },
  { $inc: { bookedCount: 1 } },                          // seat reservation
  { new: true },
);
```

MongoDB guarantees that an update to a single document is atomic, so the capacity check
and the increment cannot be interleaved by another request. If the filter does not match,
no seat is reserved and the API responds `409`.

```text
Slot capacity = 10
        ↓
10 successful bookings
        ↓
11th booking rejected  (HTTP 409 — "This slot just became full")
```

Supporting guarantees:

- Once the final seat is taken the slot is automatically marked **`FULL`**.
- A **partial unique index** on `(farmer, slot)` limited to `CONFIRMED` bookings prevents
  a farmer double-booking the same slot, even under a race.
- If booking creation fails after the seat was reserved, a **compensating update**
  returns the seat, so seats are never leaked.
- `maxBookings` cannot be edited below the number of bookings already taken.
- **Cancellation restores availability**: the seat is returned with `$inc: -1`, and a slot
  previously marked `FULL` is automatically reopened to `ACTIVE`. A farmer can then
  re-book that slot.

This approach requires no multi-document transaction, so it works on a standalone
MongoDB and on the MongoDB Atlas free tier.

**Verified:** the automated suite fires 25 simultaneous booking requests from 25 distinct
farmers at a slot with capacity 10 and asserts exactly 10 × `201` and 15 × `409`, with
`bookedCount === 10` and status `FULL`.

---

## 13. The mock layer (`client/src/data/mock/`)

This folder is the Part 1 offline fallback. **It is not used by default any more** — the
frontend talks to the real API.

It is kept so the UI can still be developed without a running backend:

```env
# client/.env
VITE_USE_MOCK_API=true
```

Only `client/src/services/*` import it, behind an `isMockMode()` guard. No page or
component touches it. It can be deleted outright once it is no longer useful.

---

## 14. A note on `src/app/` (sandbox preview host)

This repository was developed in a sandbox that serves the app from a single port and
requires a Node host exposing `/api/health`. `src/app/` is that host and contains **no
application logic**:

- `GET /api/health` — preview liveness probe
- `GET /api/*` — reverse-proxies to the Express API in `server/`
- `GET /*` — serves the built SPA shell so React Router deep links work

`npm start` at the repository root runs `scripts/start-preview.mjs`, which launches the
Express API and the web host together. For the preview only, the API runs with
`USE_IN_MEMORY_DB=true` and `SEED_ON_START=true` so the demo works without Atlas
credentials; that data resets on every restart.

**None of this is needed for normal development.** Use the two documented processes:
`cd server && npm run dev` and `cd client && npm run dev`.

---

## 15. Testing

### Automated API tests

A full end-to-end suite runs the real Express app against a real (temporary, in-memory)
MongoDB, so Mongoose schemas, indexes and the atomic booking logic are genuinely
exercised. No Atlas credentials are needed.

```bash
cd server
npm run test:api
```

**Result: 48 passed, 0 failed.** Coverage:

| Group | Checks |
| --- | --- |
| Health & authentication | 11 — health, registration, duplicate phone, field validation, farmer/admin login, wrong password, cross-portal login rejection, `/auth/me`, missing token, malformed JWT |
| Role-based authorization | 3 — farmer→admin route `403`, admin→booking `403`, anonymous→admin `401` |
| Centre management | 9 — create, validation, list, search, district filter, details + slot summary, unknown id `404`, update, soft-deactivate (record retained) |
| Slot management | 7 — create, `endTime <= startTime` rejected, duplicate start time `409`, list, update capacity, close, closed-slot booking rejected, reopen |
| Booking lifecycle | 8 — create + seat consumed, duplicate `409` with no seat leak, my bookings, details, other farmer `403`, cancel + seat released, double-cancel `409`, re-book after cancel |
| Capacity & concurrency | 3 — **25 concurrent requests on capacity 10 ⇒ exactly 10 confirmed**, 11th rejected, capacity cannot drop below bookings |
| Admin views & statistics | 4 — all bookings, reference search, centre-scoped bookings, dashboard aggregates |
| Error handling | 2 — unknown route `404` JSON, malformed ObjectId `400` |

### Manual test checklist

Verified manually against a running stack (seeded database, API on `:5000`):

- [x] Farmer registration — validation errors, duplicate phone rejected, auto sign-in
- [x] Farmer login — wrong password rejected, correct password issues a JWT
- [x] Admin login — email + password, farmer credentials rejected on the admin portal
- [x] Centre creation — appears in the centre list
- [x] Slot creation — appears on the centre's slot page with correct availability
- [x] Booking — confirmation modal shows the generated reference
- [x] Full-slot rejection — booking a full slot shows a clear error
- [x] Cancellation — status becomes Cancelled and the seat is released
- [x] Authorization — farmer tokens receive `403` on admin routes
- [x] Admin statistics — counts match the seeded data
- [x] Concurrent booking — capacity never exceeded

### What was **not** tested

- No browser-automation (Playwright/Cypress) suite exists. UI flows were verified through
  the API contract and server-side rendering checks, not by clicking in a real browser.
- No frontend unit tests (Jest/Vitest).
- Not tested against a real MongoDB Atlas cluster — no Atlas credentials were available
  in the development environment. Testing used a genuine MongoDB 7.0 server (in-memory
  and standalone). The Atlas connection path is standard Mongoose and unchanged, but it
  has not been executed against Atlas itself.

---

## 16. Troubleshooting

| Problem | Cause | Solution |
| --- | --- | --- |
| `[db] failed to connect to MongoDB` | Wrong URI, wrong password, or your IP is not allowed | Check `MONGODB_URI`; URL-encode special characters in the password; add your IP under Atlas → Network Access |
| `[config] cannot start - JWT_SECRET is not set` | `server/.env` missing or incomplete | `cp .env.example .env` and fill in `JWT_SECRET` and `MONGODB_URI` |
| `JWT_SECRET is too short` | Secret under 16 characters | Generate one: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| Frontend loads but every request fails | Backend not running | Start it: `cd server && npm run dev` |
| `503 — The API server is not reachable` | Backend down or on a different port | Confirm the API is on `PORT`, and that the Vite proxy target matches |
| CORS error in the browser console | Frontend origin not in the allow-list | Set `CLIENT_URL` in `server/.env` to the exact origin (e.g. `http://localhost:5173`) and restart the API |
| `401 Invalid authentication token` | Token expired, or `JWT_SECRET` changed after the token was issued | Sign out and sign in again |
| `403` on an admin page | Signed in as a farmer | Sign out, then sign in at `/admin/login` |
| `EADDRINUSE: port 5000` | Another process is on the port | `lsof -i :5000` then kill it, or change `PORT` in `server/.env` |
| Port 5173 already in use | Another Vite instance | Stop it, or run `npm run dev -- --port 5174` |
| Login fails with the demo credentials | Database not seeded | `cd server && npm run seed` |
| Seed says "USE_IN_MEMORY_DB=true … no effect" | Seeding a throwaway database | Set `USE_IN_MEMORY_DB=false` and a real `MONGODB_URI` |
| Data disappears after restart | `USE_IN_MEMORY_DB=true` | Set it to `false` and use a real `MONGODB_URI` |

---

## Development status

### Part 1
✅ Frontend foundation completed

### Part 2
✅ Backend API
✅ MongoDB integration
✅ Authentication
✅ Authorization
✅ Centre management
✅ Slot management
✅ Persistent booking
✅ Safe capacity management
✅ Admin statistics
✅ Input validation & error handling
✅ Automated API test suite (48 passing)

### Part 3
🚧 Planned — real-time queue tracking, check-in, live queue position, ETA calculation,
counter management, notifications, procurement progress, payment status, advanced
analytics, AI-powered recommendations
