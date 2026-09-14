/**
 * DEVELOPMENT-ONLY in-memory API simulation for Part 1.
 *
 * This is NOT a backend. It is a browser-side stand-in that returns the exact
 * response shapes the Express API of Part 2 will return, so the UI can be built
 * and demonstrated first. State lives in localStorage and is wiped by clearing
 * site data. There is no security here whatsoever.
 */
import {
  BOOKING_STATUS,
  CENTRE_STATUS,
  ROLES,
  SLOT_STATUS,
} from '../../utils/constants.js';
import { STORAGE_KEYS, readJSON, writeJSON } from '../../utils/storage.js';
import { createApiError } from '../../services/apiError.js';
import { mockUsers } from './mockUsers.js';
import { mockCentres } from './mockCentres.js';
import { buildMockSlots } from './mockSlots.js';
import { buildMockBookings } from './mockBookings.js';

const STATE_VERSION = 3;

function seedState() {
  const slots = buildMockSlots();
  return {
    version: STATE_VERSION,
    users: mockUsers.map((user) => ({ ...user })),
    centres: mockCentres.map((centre) => ({ ...centre })),
    slots,
    bookings: buildMockBookings(slots),
    counter: 1006,
  };
}

let state = null;

function load() {
  if (state) return state;
  const stored = readJSON(STORAGE_KEYS.MOCK_DB);
  state = stored && stored.version === STATE_VERSION ? stored : seedState();
  return state;
}

function persist() {
  writeJSON(STORAGE_KEYS.MOCK_DB, state);
}

export function resetMockState() {
  state = seedState();
  persist();
}

/** Simulated network latency so loading states are actually visible. */
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const clone = (value) => JSON.parse(JSON.stringify(value));

const publicUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

function userFromToken(token) {
  const db = load();
  const id = String(token || '').replace('dev-token.', '');
  return db.users.find((user) => user.id === id) || null;
}

function requireUser(token) {
  const user = userFromToken(token);
  if (!user) throw createApiError('Your session has expired. Please sign in again.', 401);
  return user;
}

/* ------------------------------------------------------------------ auth */

export async function register(payload) {
  await delay();
  const db = load();
  const phone = String(payload.phone).trim();

  if (db.users.some((user) => user.phone === phone)) {
    throw createApiError('An account with this mobile number already exists.', 409, {
      phone: 'This mobile number is already registered.',
    });
  }

  const user = {
    id: `usr_farmer_${Date.now()}`,
    role: ROLES.FARMER,
    name: payload.name.trim(),
    phone,
    email: (payload.email || '').trim(),
    password: payload.password,
    village: payload.village.trim(),
    district: payload.district.trim(),
    state: payload.state,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  persist();
  return { token: `dev-token.${user.id}`, user: publicUser(user) };
}

export async function login({ identifier, password, role }) {
  await delay();
  const db = load();
  const key = String(identifier || '').trim().toLowerCase();

  const user = db.users.find(
    (candidate) =>
      candidate.role === role &&
      (candidate.phone === key || (candidate.email || '').toLowerCase() === key),
  );

  if (!user || user.password !== password) {
    throw createApiError(
      role === ROLES.ADMIN
        ? 'Invalid official email or password.'
        : 'Invalid mobile number or password.',
      401,
    );
  }

  return { token: `dev-token.${user.id}`, user: publicUser(user) };
}

export async function me(token) {
  await delay(150);
  return { user: publicUser(requireUser(token)) };
}

/* --------------------------------------------------------------- centres */

export async function listCentres(params = {}) {
  await delay();
  const db = load();
  const search = (params.search || '').trim().toLowerCase();

  return clone(
    db.centres.filter((centre) => {
      if (params.status && centre.status !== params.status) return false;
      if (params.district && centre.district !== params.district) return false;
      if (params.state && centre.state !== params.state) return false;
      if (!search) return true;
      return (
        centre.name.toLowerCase().includes(search) ||
        centre.address.toLowerCase().includes(search) ||
        centre.district.toLowerCase().includes(search)
      );
    }),
  );
}

export async function getCentre(centreId) {
  await delay();
  const db = load();
  const centre = db.centres.find((item) => item.id === centreId);
  if (!centre) throw createApiError('Procurement centre not found.', 404);

  const slots = db.slots.filter((slot) => slot.centreId === centreId);
  const openSlots = slots.filter(
    (slot) => slot.status === SLOT_STATUS.ACTIVE && slot.bookedCount < slot.maxBookings,
  );

  return clone({
    ...centre,
    slotSummary: {
      total: slots.length,
      open: openSlots.length,
      seatsAvailable: openSlots.reduce(
        (sum, slot) => sum + (slot.maxBookings - slot.bookedCount),
        0,
      ),
    },
  });
}

export async function createCentre(payload) {
  await delay();
  const db = load();
  const centre = {
    id: `ctr_${Date.now()}`,
    name: payload.name.trim(),
    address: payload.address.trim(),
    district: payload.district.trim(),
    state: payload.state,
    status: payload.status || CENTRE_STATUS.ACTIVE,
    inchargeName: (payload.inchargeName || '').trim(),
    contactPhone: (payload.contactPhone || '').trim(),
    commodities: [],
    counters: 1,
    createdAt: new Date().toISOString(),
  };
  db.centres.unshift(centre);
  persist();
  return clone(centre);
}

export async function updateCentre(centreId, payload) {
  await delay();
  const db = load();
  const centre = db.centres.find((item) => item.id === centreId);
  if (!centre) throw createApiError('Procurement centre not found.', 404);

  Object.assign(centre, {
    name: payload.name.trim(),
    address: payload.address.trim(),
    district: payload.district.trim(),
    state: payload.state,
    status: payload.status,
    inchargeName: (payload.inchargeName ?? centre.inchargeName ?? '').trim(),
    contactPhone: (payload.contactPhone ?? centre.contactPhone ?? '').trim(),
  });
  persist();
  return clone(centre);
}

/** Soft deactivation - centres are never physically removed. */
export async function setCentreStatus(centreId, status) {
  await delay();
  const db = load();
  const centre = db.centres.find((item) => item.id === centreId);
  if (!centre) throw createApiError('Procurement centre not found.', 404);
  centre.status = status;
  persist();
  return clone(centre);
}

/* ----------------------------------------------------------------- slots */

export async function listSlots(centreId, params = {}) {
  await delay();
  const db = load();
  return clone(
    db.slots
      .filter((slot) => slot.centreId === centreId)
      .filter((slot) => (params.date ? slot.date === params.date : true))
      .filter((slot) => (params.status ? slot.status === params.status : true))
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)),
  );
}

export async function createSlot(centreId, payload) {
  await delay();
  const db = load();
  const slot = {
    id: `slt_${Date.now()}`,
    centreId,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    maxBookings: Number(payload.maxBookings),
    bookedCount: 0,
    status: payload.status || SLOT_STATUS.ACTIVE,
  };
  db.slots.push(slot);
  persist();
  return clone(slot);
}

export async function updateSlot(slotId, payload) {
  await delay();
  const db = load();
  const slot = db.slots.find((item) => item.id === slotId);
  if (!slot) throw createApiError('Slot not found.', 404);
  Object.assign(slot, {
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    maxBookings: Number(payload.maxBookings),
    status: payload.status,
  });
  persist();
  return clone(slot);
}

export async function setSlotStatus(slotId, status) {
  await delay();
  const db = load();
  const slot = db.slots.find((item) => item.id === slotId);
  if (!slot) throw createApiError('Slot not found.', 404);
  slot.status = status;
  persist();
  return clone(slot);
}

export async function closeSlot(slotId) {
  return setSlotStatus(slotId, SLOT_STATUS.CLOSED);
}

/* -------------------------------------------------------------- bookings */

function expand(booking, db) {
  const centre = db.centres.find((item) => item.id === booking.centreId);
  const farmer = db.users.find((item) => item.id === booking.farmerId);
  return {
    ...booking,
    centreName: centre?.name ?? 'Unknown centre',
    centreAddress: centre?.address ?? '',
    centreDistrict: centre?.district ?? '',
    centreState: centre?.state ?? '',
    farmerName: farmer?.name ?? 'Unknown farmer',
    farmerPhone: farmer?.phone ?? '',
    farmerVillage: farmer?.village ?? '',
  };
}

export async function createBooking(token, { centreId, slotId }) {
  await delay(600);
  const db = load();
  const user = requireUser(token);

  const slot = db.slots.find((item) => item.id === slotId && item.centreId === centreId);
  if (!slot) throw createApiError('The selected slot is no longer available.', 404);
  if (slot.status !== SLOT_STATUS.ACTIVE)
    throw createApiError('This slot is not open for booking.', 409);
  if (slot.bookedCount >= slot.maxBookings)
    throw createApiError('This slot just became full. Please choose another slot.', 409);

  const duplicate = db.bookings.find(
    (booking) =>
      booking.farmerId === user.id &&
      booking.slotId === slotId &&
      booking.status === BOOKING_STATUS.CONFIRMED,
  );
  if (duplicate) throw createApiError('You already have a confirmed booking for this slot.', 409);

  db.counter += 1;
  const booking = {
    id: `bkg_${Date.now()}`,
    reference: `KP-2026-${db.counter}`,
    farmerId: user.id,
    centreId,
    slotId,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: BOOKING_STATUS.CONFIRMED,
    createdAt: new Date().toISOString(),
  };

  slot.bookedCount += 1;
  if (slot.bookedCount >= slot.maxBookings) slot.status = SLOT_STATUS.FULL;

  db.bookings.unshift(booking);
  persist();
  return clone(expand(booking, db));
}

export async function myBookings(token) {
  await delay();
  const db = load();
  const user = requireUser(token);
  return clone(
    db.bookings
      .filter((booking) => booking.farmerId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((booking) => expand(booking, db)),
  );
}

export async function getBooking(token, bookingId) {
  await delay();
  const db = load();
  const user = requireUser(token);
  const booking = db.bookings.find((item) => item.id === bookingId);
  if (!booking) throw createApiError('Booking not found.', 404);
  if (user.role === ROLES.FARMER && booking.farmerId !== user.id)
    throw createApiError('You do not have access to this booking.', 403);
  return clone(expand(booking, db));
}

export async function cancelBooking(token, bookingId) {
  await delay();
  const db = load();
  const user = requireUser(token);
  const booking = db.bookings.find((item) => item.id === bookingId);
  if (!booking) throw createApiError('Booking not found.', 404);
  if (user.role === ROLES.FARMER && booking.farmerId !== user.id)
    throw createApiError('You do not have access to this booking.', 403);
  if (booking.status === BOOKING_STATUS.CANCELLED)
    throw createApiError('This booking is already cancelled.', 409);

  booking.status = BOOKING_STATUS.CANCELLED;
  const slot = db.slots.find((item) => item.id === booking.slotId);
  if (slot) {
    slot.bookedCount = Math.max(0, slot.bookedCount - 1);
    if (slot.status === SLOT_STATUS.FULL) slot.status = SLOT_STATUS.ACTIVE;
  }
  persist();
  return clone(expand(booking, db));
}

/* ----------------------------------------------------------------- admin */

export async function adminBookings(params = {}) {
  await delay();
  const db = load();
  const search = (params.search || '').trim().toLowerCase();

  return clone(
    db.bookings
      .filter((booking) => (params.centreId ? booking.centreId === params.centreId : true))
      .filter((booking) => (params.status ? booking.status === params.status : true))
      .filter((booking) => (params.date ? booking.date === params.date : true))
      .map((booking) => expand(booking, db))
      .filter((booking) =>
        search
          ? booking.reference.toLowerCase().includes(search) ||
            booking.farmerName.toLowerCase().includes(search) ||
            booking.farmerPhone.includes(search)
          : true,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

export async function adminStats() {
  await delay();
  const db = load();
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  const today = new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);

  const activeCentres = db.centres.filter((c) => c.status === CENTRE_STATUS.ACTIVE);
  const todaysSlots = db.slots.filter((slot) => slot.date === today);
  const todaysBookings = db.bookings.filter((booking) => booking.date === today);

  return {
    totalCentres: db.centres.length,
    activeCentres: activeCentres.length,
    inactiveCentres: db.centres.length - activeCentres.length,
    todaysSlots: todaysSlots.length,
    todaysBookings: todaysBookings.length,
    confirmedToday: todaysBookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED).length,
    cancelledToday: todaysBookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED).length,
    registeredFarmers: db.users.filter((user) => user.role === ROLES.FARMER).length,
  };
}
