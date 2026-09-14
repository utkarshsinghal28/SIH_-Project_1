/**
 * End-to-end API tests for the Part 2 backend.
 *
 * Runs the real Express app against a real (temporary, in-memory) MongoDB, so
 * Mongoose schemas, indexes and the atomic booking logic are genuinely exercised.
 *
 * Usage: cd server && npm run test:api
 */
import './setupEnv.js';

import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import User, { ROLES } from '../models/User.js';
import Centre from '../models/Centre.js';
import Slot from '../models/Slot.js';

let baseUrl = '';
let server = null;
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`  ✗ ${name}\n      ${error.message}`);
    failed += 1;
  }
}

function section(title) {
  console.log(`\n${title}`);
}

async function api(method, path, { token, body } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }
  return { status: res.status, body: json };
}

async function main() {
  await connectDatabase();
  const app = createApp();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}/api`;
      resolve();
    });
  });

  // ---- fixtures ----------------------------------------------------------
  const admin = await User.create({
    name: 'Test Admin',
    phone: '9999999999',
    email: 'admin@krishi.gov.in',
    passwordHash: await User.hashPassword('Admin@123'),
    role: ROLES.ADMIN,
    designation: 'District Procurement Officer',
  });
  await User.create({
    name: 'Ramesh Patil',
    phone: '9876543210',
    passwordHash: await User.hashPassword('Farmer@123'),
    role: ROLES.FARMER,
    village: 'Shirwal',
    district: 'Satara',
    state: 'Maharashtra',
  });
  const centre = await Centre.create({
    name: 'Satara Taluka Procurement Centre',
    address: 'Powai Naka, Satara',
    district: 'Satara',
    state: 'Maharashtra',
    status: 'ACTIVE',
    createdBy: admin._id,
  });

  let adminToken = '';
  let farmerToken = '';
  let farmerId = '';

  /* ------------------------------------------------------ health + auth */
  section('Health & authentication');

  await test('GET /api/health reports a connected database', async () => {
    const { status, body } = await api('GET', '/health');
    assert.equal(status, 200);
    assert.equal(body.data.database, 'connected');
  });

  await test('POST /api/auth/register creates a farmer and returns a JWT', async () => {
    const { status, body } = await api('POST', '/auth/register', {
      body: {
        name: 'New Farmer',
        phone: '9811111111',
        email: 'new.farmer@example.com',
        password: 'Secret@123',
        village: 'Testpur',
        district: 'Satara',
        state: 'Maharashtra',
      },
    });
    assert.equal(status, 201);
    assert.ok(body.data.token, 'token missing');
    assert.equal(body.data.user.role, 'FARMER');
    assert.equal(body.data.user.passwordHash, undefined, 'password hash leaked');
  });

  await test('registration rejects a duplicate mobile number (409)', async () => {
    const { status, body } = await api('POST', '/auth/register', {
      body: {
        name: 'Duplicate',
        phone: '9811111111',
        password: 'Secret@123',
        village: 'X',
        district: 'Y',
        state: 'Maharashtra',
      },
    });
    assert.equal(status, 409);
    assert.ok(body.errors?.phone);
  });

  await test('registration rejects invalid input with field errors (400)', async () => {
    const { status, body } = await api('POST', '/auth/register', {
      body: { name: 'ab', phone: '123', password: '1', village: '', district: '', state: '' },
    });
    assert.equal(status, 400);
    assert.ok(body.errors.phone && body.errors.password && body.errors.village);
  });

  await test('POST /api/auth/login signs a farmer in', async () => {
    const { status, body } = await api('POST', '/auth/login', {
      body: { identifier: '9876543210', password: 'Farmer@123', role: 'FARMER' },
    });
    assert.equal(status, 200);
    farmerToken = body.data.token;
    farmerId = body.data.user.id;
    assert.ok(farmerToken);
  });

  await test('login rejects a wrong password (401)', async () => {
    const { status } = await api('POST', '/auth/login', {
      body: { identifier: '9876543210', password: 'wrong', role: 'FARMER' },
    });
    assert.equal(status, 401);
  });

  await test('a farmer cannot sign in through the admin portal (401)', async () => {
    const { status } = await api('POST', '/auth/login', {
      body: { identifier: '9876543210', password: 'Farmer@123', role: 'ADMIN' },
    });
    assert.equal(status, 401);
  });

  await test('POST /api/auth/login signs an admin in by email', async () => {
    const { status, body } = await api('POST', '/auth/login', {
      body: { identifier: 'admin@krishi.gov.in', password: 'Admin@123', role: 'ADMIN' },
    });
    assert.equal(status, 200);
    adminToken = body.data.token;
    assert.equal(body.data.user.role, 'ADMIN');
  });

  await test('GET /api/auth/me returns the current user', async () => {
    const { status, body } = await api('GET', '/auth/me', { token: farmerToken });
    assert.equal(status, 200);
    assert.equal(body.data.user.phone, '9876543210');
  });

  await test('GET /api/auth/me without a token is rejected (401)', async () => {
    const { status } = await api('GET', '/auth/me');
    assert.equal(status, 401);
  });

  await test('a malformed JWT is rejected (401)', async () => {
    const { status } = await api('GET', '/auth/me', { token: 'not.a.jwt' });
    assert.equal(status, 401);
  });

  /* ----------------------------------------------------------- authz */
  section('Role-based authorization');

  await test('a farmer token cannot reach admin routes (403)', async () => {
    const { status } = await api('GET', '/admin/stats', { token: farmerToken });
    assert.equal(status, 403);
  });

  await test('an admin token cannot create a booking (403)', async () => {
    const { status } = await api('POST', '/bookings', {
      token: adminToken,
      body: { centreId: String(centre._id), slotId: String(centre._id) },
    });
    assert.equal(status, 403);
  });

  await test('admin routes reject anonymous requests (401)', async () => {
    const { status } = await api('POST', '/admin/centres', {
      body: { name: 'Hack Centre', address: 'x', district: 'y', state: 'Maharashtra' },
    });
    assert.equal(status, 401);
  });

  /* --------------------------------------------------------- centres */
  section('Centre management');

  let createdCentreId = '';

  await test('POST /api/admin/centres creates a centre', async () => {
    const { status, body } = await api('POST', '/admin/centres', {
      token: adminToken,
      body: {
        name: 'Karad Block Procurement Centre',
        address: 'Bus Stand Road, Karad',
        district: 'Satara',
        state: 'Maharashtra',
        status: 'ACTIVE',
      },
    });
    assert.equal(status, 201);
    createdCentreId = body.data.id;
    assert.ok(createdCentreId);
  });

  await test('centre creation validates required fields (400)', async () => {
    const { status, body } = await api('POST', '/admin/centres', {
      token: adminToken,
      body: { name: 'x', address: '', district: '', state: '' },
    });
    assert.equal(status, 400);
    assert.ok(body.errors.name);
  });

  await test('GET /api/centres lists centres', async () => {
    const { status, body } = await api('GET', '/centres');
    assert.equal(status, 200);
    assert.ok(body.data.length >= 2);
    assert.ok(body.data[0].id);
  });

  await test('GET /api/centres?search= filters by name', async () => {
    const { body } = await api('GET', '/centres?search=karad');
    assert.equal(body.data.length, 1);
    assert.match(body.data[0].name, /Karad/);
  });

  await test('GET /api/centres?district= filters by district', async () => {
    const { body } = await api('GET', '/centres?district=Satara');
    assert.ok(body.data.every((c) => c.district === 'Satara'));
  });

  await test('GET /api/centres/:id returns details with a slot summary', async () => {
    const { status, body } = await api('GET', `/centres/${centre._id}`);
    assert.equal(status, 200);
    assert.ok(body.data.slotSummary);
  });

  await test('GET /api/centres/:id with an unknown id returns 404', async () => {
    const { status } = await api('GET', '/centres/60f000000000000000000000');
    assert.equal(status, 404);
  });

  await test('PUT /api/admin/centres/:id updates a centre', async () => {
    const { status, body } = await api('PUT', `/admin/centres/${createdCentreId}`, {
      token: adminToken,
      body: {
        name: 'Karad Block Procurement Centre (Updated)',
        address: 'Bus Stand Road, Karad',
        district: 'Satara',
        state: 'Maharashtra',
      },
    });
    assert.equal(status, 200);
    assert.match(body.data.name, /Updated/);
  });

  await test('PATCH /api/admin/centres/:id/status soft-deactivates (record retained)', async () => {
    const { status, body } = await api('PATCH', `/admin/centres/${createdCentreId}/status`, {
      token: adminToken,
      body: { status: 'INACTIVE' },
    });
    assert.equal(status, 200);
    assert.equal(body.data.status, 'INACTIVE');
    assert.ok(await Centre.findById(createdCentreId), 'centre was physically deleted');
  });

  /* ----------------------------------------------------------- slots */
  section('Slot management');

  let slotId = '';
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  await test('POST /api/admin/centres/:centreId/slots creates a slot', async () => {
    const { status, body } = await api('POST', `/admin/centres/${centre._id}/slots`, {
      token: adminToken,
      body: { date: today, startTime: '10:00', endTime: '11:00', maxBookings: 20, status: 'ACTIVE' },
    });
    assert.equal(status, 201);
    slotId = body.data.id;
    assert.equal(body.data.bookedCount, 0);
  });

  await test('slot creation rejects endTime <= startTime (400)', async () => {
    const { status, body } = await api('POST', `/admin/centres/${centre._id}/slots`, {
      token: adminToken,
      body: { date: today, startTime: '12:00', endTime: '11:00', maxBookings: 5 },
    });
    assert.equal(status, 400);
    assert.ok(body.errors.endTime);
  });

  await test('slot creation rejects a duplicate start time (409)', async () => {
    const { status } = await api('POST', `/admin/centres/${centre._id}/slots`, {
      token: adminToken,
      body: { date: today, startTime: '10:00', endTime: '11:00', maxBookings: 20 },
    });
    assert.equal(status, 409);
  });

  await test('GET /api/centres/:centreId/slots lists slots', async () => {
    const { status, body } = await api('GET', `/centres/${centre._id}/slots`);
    assert.equal(status, 200);
    assert.ok(body.data.length >= 1);
    assert.equal(body.data[0].centreId, String(centre._id));
  });

  await test('PUT /api/admin/slots/:id updates capacity', async () => {
    const { status, body } = await api('PUT', `/admin/slots/${slotId}`, {
      token: adminToken,
      body: { date: today, startTime: '10:00', endTime: '11:30', maxBookings: 25 },
    });
    assert.equal(status, 200);
    assert.equal(body.data.maxBookings, 25);
  });

  await test('PATCH /api/admin/slots/:id/status closes a slot', async () => {
    const { status, body } = await api('PATCH', `/admin/slots/${slotId}/status`, {
      token: adminToken,
      body: { status: 'CLOSED' },
    });
    assert.equal(status, 200);
    assert.equal(body.data.status, 'CLOSED');
  });

  await test('a closed slot cannot be booked (409)', async () => {
    const { status } = await api('POST', '/bookings', {
      token: farmerToken,
      body: { centreId: String(centre._id), slotId },
    });
    assert.equal(status, 409);
  });

  await test('reopening the slot restores bookability', async () => {
    const { status } = await api('PATCH', `/admin/slots/${slotId}/status`, {
      token: adminToken,
      body: { status: 'ACTIVE' },
    });
    assert.equal(status, 200);
  });

  /* -------------------------------------------------------- bookings */
  section('Booking lifecycle');

  let bookingId = '';

  await test('POST /api/bookings creates a booking and consumes a seat', async () => {
    const { status, body } = await api('POST', '/bookings', {
      token: farmerToken,
      body: { centreId: String(centre._id), slotId },
    });
    assert.equal(status, 201);
    bookingId = body.data.id;
    assert.match(body.data.reference, /^KP-\d{4}-\d+$/);
    assert.equal(body.data.status, 'CONFIRMED');
    assert.ok(body.data.centreName, 'centre not populated');
    const slot = await Slot.findById(slotId);
    assert.equal(slot.bookedCount, 1);
  });

  await test('a duplicate booking for the same slot is rejected (409)', async () => {
    const { status } = await api('POST', '/bookings', {
      token: farmerToken,
      body: { centreId: String(centre._id), slotId },
    });
    assert.equal(status, 409);
    const slot = await Slot.findById(slotId);
    assert.equal(slot.bookedCount, 1, 'seat leaked on rejected duplicate');
  });

  await test('GET /api/bookings/my lists the farmer\'s bookings', async () => {
    const { status, body } = await api('GET', '/bookings/my', { token: farmerToken });
    assert.equal(status, 200);
    assert.ok(body.data.some((b) => b.id === bookingId));
  });

  await test('GET /api/bookings/:id returns booking details', async () => {
    const { status, body } = await api('GET', `/bookings/${bookingId}`, { token: farmerToken });
    assert.equal(status, 200);
    assert.equal(body.data.id, bookingId);
  });

  await test('a farmer cannot read another farmer\'s booking (403)', async () => {
    const other = await api('POST', '/auth/login', {
      body: { identifier: '9811111111', password: 'Secret@123', role: 'FARMER' },
    });
    const { status } = await api('GET', `/bookings/${bookingId}`, {
      token: other.body.data.token,
    });
    assert.equal(status, 403);
  });

  await test('PATCH /api/bookings/:id/cancel cancels and releases the seat', async () => {
    const before = (await Slot.findById(slotId)).bookedCount;
    const { status, body } = await api('PATCH', `/bookings/${bookingId}/cancel`, {
      token: farmerToken,
    });
    assert.equal(status, 200);
    assert.equal(body.data.status, 'CANCELLED');
    const after = (await Slot.findById(slotId)).bookedCount;
    assert.equal(after, before - 1);
  });

  await test('cancelling twice is rejected (409)', async () => {
    const { status } = await api('PATCH', `/bookings/${bookingId}/cancel`, { token: farmerToken });
    assert.equal(status, 409);
  });

  await test('a farmer can re-book a slot after cancelling', async () => {
    const { status } = await api('POST', '/bookings', {
      token: farmerToken,
      body: { centreId: String(centre._id), slotId },
    });
    assert.equal(status, 201);
  });

  /* ----------------------------------------------------- concurrency */
  section('Capacity & concurrency safety');

  await test('capacity 10 + 25 simultaneous requests => exactly 10 confirmed', async () => {
    const capacitySlot = await Slot.create({
      centre: centre._id,
      date: today,
      startTime: '16:00',
      endTime: '17:00',
      maxBookings: 10,
      status: 'ACTIVE',
    });

    // 25 distinct farmers so the per-farmer duplicate guard is not what limits us.
    const tokens = [];
    for (let i = 0; i < 25; i += 1) {
      const phone = `98${String(20000000 + i).padStart(8, '0')}`;
      // eslint-disable-next-line no-await-in-loop
      const res = await api('POST', '/auth/register', {
        body: {
          name: `Load Farmer ${i}`,
          phone,
          password: 'Secret@123',
          village: 'V',
          district: 'Satara',
          state: 'Maharashtra',
        },
      });
      tokens.push(res.body.data.token);
    }

    const results = await Promise.all(
      tokens.map((token) =>
        api('POST', '/bookings', {
          token,
          body: { centreId: String(centre._id), slotId: String(capacitySlot._id) },
        }),
      ),
    );

    const created = results.filter((r) => r.status === 201).length;
    const rejected = results.filter((r) => r.status === 409).length;

    assert.equal(created, 10, `expected exactly 10 confirmed, got ${created}`);
    assert.equal(rejected, 15, `expected 15 rejections, got ${rejected}`);

    const finalSlot = await Slot.findById(capacitySlot._id);
    assert.equal(finalSlot.bookedCount, 10, 'bookedCount drifted');
    assert.ok(finalSlot.bookedCount <= finalSlot.maxBookings, 'capacity exceeded');
    assert.equal(finalSlot.status, 'FULL', 'slot not auto-marked FULL');
  });

  await test('the 11th booking on a full slot is rejected (409)', async () => {
    const fullSlot = await Slot.findOne({ startTime: '16:00' });
    const { status } = await api('POST', '/bookings', {
      token: farmerToken,
      body: { centreId: String(centre._id), slotId: String(fullSlot._id) },
    });
    assert.equal(status, 409);
  });

  await test('capacity cannot be reduced below existing bookings (409)', async () => {
    const fullSlot = await Slot.findOne({ startTime: '16:00' });
    const { status } = await api('PUT', `/admin/slots/${fullSlot._id}`, {
      token: adminToken,
      body: { date: today, startTime: '16:00', endTime: '17:00', maxBookings: 2 },
    });
    assert.equal(status, 409);
  });

  /* -------------------------------------------------------- admin views */
  section('Admin views & statistics');

  await test('GET /api/admin/bookings lists every booking', async () => {
    const { status, body } = await api('GET', '/admin/bookings', { token: adminToken });
    assert.equal(status, 200);
    assert.ok(body.data.length >= 11);
    assert.ok(body.data[0].farmerName);
  });

  await test('GET /api/admin/bookings?search= filters by reference', async () => {
    const all = await api('GET', '/admin/bookings', { token: adminToken });
    const ref = all.body.data[0].reference;
    const { body } = await api(`GET`, `/admin/bookings?search=${ref}`, { token: adminToken });
    assert.equal(body.data.length, 1);
  });

  await test('GET /api/admin/centres/:centreId/bookings is centre-scoped', async () => {
    const { status, body } = await api('GET', `/admin/centres/${centre._id}/bookings`, {
      token: adminToken,
    });
    assert.equal(status, 200);
    assert.ok(body.data.every((b) => b.centreId === String(centre._id)));
  });

  await test('GET /api/admin/stats returns dashboard aggregates', async () => {
    const { status, body } = await api('GET', '/admin/stats', { token: adminToken });
    assert.equal(status, 200);
    const s = body.data;
    assert.equal(s.totalCentres, s.activeCentres + s.inactiveCentres);
    assert.ok(s.todaysSlots >= 1);
    assert.ok(s.todaysBookings >= 11);
    assert.ok(s.registeredFarmers >= 26);
  });

  /* ------------------------------------------------------------ misc */
  section('Error handling');

  await test('an unknown route returns 404 JSON', async () => {
    const { status, body } = await api('GET', '/does-not-exist');
    assert.equal(status, 404);
    assert.equal(body.success, false);
  });

  await test('a malformed ObjectId returns 400', async () => {
    const { status } = await api('GET', '/centres/not-an-id');
    assert.equal(status, 400);
  });

  // ---- teardown ----------------------------------------------------------
  await new Promise((resolve) => server.close(resolve));
  await disconnectDatabase();

  console.log(`\n${'='.repeat(56)}`);
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log('='.repeat(56));
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (error) => {
  console.error('\n[test] harness crashed:', error);
  try {
    if (server) server.close();
    await disconnectDatabase();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
