# Krishi Procurement Platform — SIH 2026

**Smarter Procurement. Less Waiting.**

A digital slot-booking and queue-coordination platform for agricultural procurement
centres, built for Smart India Hackathon 2026.

---

## 1. Project overview

During procurement season, a very large number of farmers arrive at a small number of
procurement centres within a few working hours. The result is long physical queues,
unpredictable waiting, crowding at peak hours and repeated follow-ups about payment.

This project lets a farmer:

1. **Register** with a mobile number and village details
2. **Book a procurement slot** at a chosen centre, date and time
3. **Track their position** (planned — Part 3)
4. **Arrive when needed**, instead of hours in advance
5. **Complete procurement** at the counter
6. **Track payment** (planned — Part 3)

…and lets procurement centre staff manage centres, publish slots and see all bookings.

The long-term differentiator is the **operational coordination layer** that connects the
digital booking to what is actually happening at the physical centre (check-in, live
queue position, counter capacity, arrival guidance). That layer is Part 3.

---

## 2. Current development stage

> ## PART 1 COMPLETE
> **Frontend and project foundation only.**

What exists today:

| Area | Status |
| --- | --- |
| React + Vite SPA, routing, layouts | ✅ Built |
| Reusable component library | ✅ Built |
| Farmer workflow screens | ✅ Built |
| Admin workflow screens | ✅ Built |
| Authentication UI + AuthContext + route guards | ✅ Built (simulated session) |
| Axios service layer prepared for the real API | ✅ Built |
| Loading / empty / error / success states | ✅ Built |
| Responsive, mobile-first design | ✅ Built |
| Express REST API, MongoDB, JWT, bcrypt, RBAC | ❌ Part 2 |
| Real persistence, atomic booking, server validation | ❌ Part 2 |
| Check-in, live queue, ETA, capacity, notifications | ❌ Part 3 |

**There is no backend in Part 1.** Data comes from an isolated, browser-only mock layer
(`client/src/data/mock/`) that returns exactly the response shapes the Part 2 API will
return. It is not a server, and no security is claimed for it.

---

## 3. Requirements

| Software | Version |
| --- | --- |
| Node.js | 20.x or newer |
| npm | 10.x or newer |
| A modern browser | Chrome / Firefox / Edge / Safari |

**Not required in Part 1:** MongoDB, Express, any database, any API key.

---

## 4. Installation

From the repository root:

```bash
npm install
```

This installs everything the client needs (React, React Router, Axios, Vite,
Tailwind CSS v4).

> The `client/` folder also has its own `package.json` so it can be lifted out and run
> standalone (`cd client && npm install`). For this repository, the root install is
> enough — do not install twice.

---

## 5. Environment setup

Part 1 runs with **zero configuration**. If you want to change the defaults:

```bash
cp client/.env.example client/.env
```

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Base URL of the Express API that Part 2 will provide |
| `VITE_USE_MOCK_API` | `true` | `true` → use the in-browser mock layer. `false` → send every request through Axios to `VITE_API_BASE_URL` |

**Part 2 will add** a separate `server/.env` containing `MONGODB_URI`, `JWT_SECRET`,
`PORT` and `CLIENT_ORIGIN`. None of those are needed yet.

---

## 6. Running the application

### Development server (this is the one you want)

```bash
npm run dev:client
```

Then open **http://localhost:5173**.

### Production build of the client

```bash
npm run build:client
```

The bundle is emitted to `public/`.

### Preview the production bundle

```bash
npm run preview:client
```

Then open **http://localhost:4173**.

### A note about the Next.js files in this repository

The workspace this project was generated in requires a Node preview host that exposes a
`/api/health` endpoint. That host lives in `src/app/` and does exactly two things:

* `GET /api/health` — a liveness probe for the sandbox
* `GET /*` — serves the built SPA shell (`public/index.html`) so React Router deep links work

It contains **no application logic, no database access and no business code**. The
application itself is the React + Vite SPA in `client/`. `npm run build` builds the
client first and then the host; `npm start` serves it.

`src/db/` and `drizzle.config.json` are leftover sandbox bootstrap scaffolding. **Nothing
in the application imports them** — this project does not use PostgreSQL or Drizzle, and
Part 2 will use MongoDB Atlas with Mongoose in a separate `server/` folder.

---

## 7. Test accounts

These accounts are **real and implemented** in `client/src/data/mock/mockUsers.js`.
They are **development-only** and exist purely because there is no backend yet.

| Role | Sign-in page | Username | Password |
| --- | --- | --- | --- |
| Farmer | `/farmer/login` | `9876543210` | `farmer123` |
| Farmer | `/farmer/login` | `9812345678` | `farmer123` |
| Admin | `/admin/login` | `admin@krishi.gov.in` | `admin123` |

You can also register a brand-new farmer at `/farmer/register`. New accounts are stored
in your browser's `localStorage` only, and disappear when you clear site data.

> To reset all demo data, clear `localStorage` for the site (keys are prefixed
> `krishi.`) and reload.

---

## 8. Routes

### Public

| Route | Page |
| --- | --- |
| `/` | Landing page |
| `/farmer/register` | Farmer registration |
| `/farmer/login` | Farmer login |
| `/admin/login` | Admin login |

### Farmer (guarded — requires a farmer session)

| Route | Page |
| --- | --- |
| `/farmer/dashboard` | Farmer dashboard |
| `/farmer/centres` | Procurement-centre list with search + district/state filters |
| `/farmer/centres/:id` | Centre details |
| `/farmer/centres/:id/slots` | Available booking slots + booking flow |
| `/farmer/bookings` | My bookings |
| `/farmer/bookings/:id` | Booking details |

### Admin (guarded — requires an admin session)

| Route | Page |
| --- | --- |
| `/admin/dashboard` | Operations dashboard |
| `/admin/centres` | Manage procurement centres |
| `/admin/centres/new` | Create centre |
| `/admin/centres/:id/edit` | Edit centre |
| `/admin/centres/:id/slots` | Manage slots (create / edit / close) |
| `/admin/bookings` | All bookings |
| `/admin/centres/:id/bookings` | Centre-specific bookings |

Any unknown path renders a 404 page.

---

## 9. Project structure

```
.
├── client/                      ← THE APPLICATION (React + Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   ├── public/                  static assets copied verbatim (favicon)
│   └── src/
│       ├── components/
│       │   ├── ui/              Button, Input, Select, Card, Modal, Table,
│       │   │                    StatusBadge, LoadingSpinner, EmptyState,
│       │   │                    ErrorState, Alert, PageHeader, ConfirmationDialog
│       │   ├── layout/          Navbar, Sidebar, Footer
│       │   ├── common/          DataState, FuturePhaseNotice, AuthCard
│       │   ├── centres/         CentreCard, CentreFilters
│       │   ├── slots/           SlotCard
│       │   └── bookings/        BookingCard, BookingsTable
│       ├── layouts/             PublicLayout, FarmerLayout, AdminLayout
│       ├── pages/
│       │   ├── auth/            registration + both logins
│       │   ├── farmer/          dashboard, centres, slots, bookings
│       │   └── admin/           dashboard, centres, slots, bookings
│       ├── context/             AuthContext, ToastContext
│       ├── hooks/               useAuth, useAsync, useDocumentTitle
│       ├── services/            api.js (Axios) + auth/centre/slot/booking services
│       ├── routes/              AppRoutes, ProtectedRoute, paths
│       ├── utils/               constants, validators, format, storage
│       ├── data/mock/           ⚠ Part 1 only — isolated mock data + mock API
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css            Tailwind v4 + design tokens
│
├── scripts/build-client.mjs     builds client/ into public/
├── public/                      generated SPA bundle (build output)
└── src/app/                     sandbox preview host only (health probe + SPA shell)
```

### Key architectural rules followed

* **No Axios calls inside components.** Every request goes through `src/services/`.
* **Mock data is isolated.** Only `src/services/*` import `src/data/mock/*`; no page or
  component does. Removing the mock layer is a config flag plus a folder delete.
* **One error shape.** Both the Axios interceptor and the mock layer produce the same
  `ApiError` object, so pages never branch on data source.
* **Every data screen has four states** (loading / error / empty / content) via the
  `DataState` component. There are no blank screens.
* **Route guards are UX, not security.** Real authorisation is server-side in Part 2.

---

## 10. Current limitations

These are deliberate. They are **not** bugs.

* ❌ **No backend.** No Express server, no REST API, no MongoDB, no Mongoose.
* ❌ **No real authentication.** The "token" is a development string; passwords are
  compared in plain text in the browser. No JWT, no bcrypt, no sessions.
* ❌ **No persistence.** Everything lives in `localStorage` and is per-browser.
  Two devices do not see the same data.
* ❌ **No real booking engine.** Slot capacity is not enforced atomically; there is no
  concurrency protection and no transaction.
* ❌ **No server-side validation.** All validation in this build is UX validation only.
* ❌ **No queue, ETA, capacity or check-in features.** Screens reserve space for them
  and label them clearly as not implemented; no live data is simulated anywhere.
* ❌ **No notifications, SMS, payments, Aadhaar or government API integrations.**

---

## 11. Next stage

### Part 2 — Backend

* Node.js + Express REST API
* MongoDB Atlas + Mongoose models (User, Centre, Slot, Booking)
* JWT authentication + bcrypt password hashing
* Role-based access control (FARMER / ADMIN)
* Centre management endpoints (with soft deactivation)
* Slot management endpoints
* Booking engine with **atomic** slot capacity handling and concurrency protection
* Server-side validation and filtering
* Real persistence

Switching the frontend over is a two-line change:
`VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL=<api url>`.

The endpoints the client is already written against:

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/centres
GET    /api/centres/:id
GET    /api/centres/:centreId/slots

POST   /api/bookings
GET    /api/bookings/my
GET    /api/bookings/:id
PATCH  /api/bookings/:id/cancel

GET    /api/admin/bookings
GET    /api/admin/centres/:centreId/bookings
GET    /api/admin/stats
POST   /api/admin/centres
PUT    /api/admin/centres/:id
PATCH  /api/admin/centres/:id/status
POST   /api/admin/centres/:centreId/slots
PUT    /api/admin/slots/:slotId
PATCH  /api/admin/slots/:slotId/close
```

### Part 3 — Integration + real-time operations

* Real API integration end to end
* Check-in at the centre
* Digital representation of the physical queue
* Dynamic queue position and estimated waiting time
* Centre capacity and active counters
* Operational incidents
* Dynamic arrival recommendations
* Notifications
* Procurement progress and payment status
* Real-time updates where appropriate
* Final testing and the SIH demo flow

---

## 12. Target architecture

```
React + Vite (client/)
        │  Axios
        ▼
Node.js + Express REST API        ← Part 2
        │  Mongoose
        ▼
MongoDB Atlas                      ← Part 2
        +
Operational intelligence layer     ← Part 3
```
