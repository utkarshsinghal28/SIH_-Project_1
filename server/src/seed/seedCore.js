/**
 * Reusable seeding routine.
 *
 * Assumes a live Mongoose connection. Used by:
 *   - `npm run seed`            (CLI, against MongoDB Atlas)
 *   - SEED_ON_START=true        (demo bootstrap for an in-memory database)
 *
 * Idempotent: existing records are skipped, so it is safe to run repeatedly.
 */
import User from '../models/User.js';
import Centre, { CENTRE_STATUS } from '../models/Centre.js';
import Slot, { SLOT_STATUS } from '../models/Slot.js';
import Booking, { BOOKING_STATUS } from '../models/Booking.js';
import Counter from '../models/Counter.js';
import { centres, timeBlocks, users } from './seedData.js';

function addDays(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

export async function seedDatabase({ fresh = false, log = console.log } = {}) {
  if (fresh) {
    log('[seed] --fresh: clearing existing collections');
    await Promise.all([
      User.deleteMany({}),
      Centre.deleteMany({}),
      Slot.deleteMany({}),
      Booking.deleteMany({}),
      Counter.deleteMany({}),
    ]);
  }

  // ---- users -------------------------------------------------------------
  const userDocs = {};
  let usersCreated = 0;

  for (const spec of users) {
    let user = await User.findOne({ phone: spec.phone });
    if (!user) {
      user = await User.create({
        name: spec.name,
        phone: spec.phone,
        email: spec.email,
        passwordHash: await User.hashPassword(spec.password),
        role: spec.role,
        village: spec.village ?? '',
        district: spec.district ?? '',
        state: spec.state ?? '',
        designation: spec.designation ?? '',
      });
      usersCreated += 1;
    }
    userDocs[spec.phone] = user;
  }

  const admin = userDocs['9999999999'];

  // ---- centres -----------------------------------------------------------
  const centreDocs = [];
  let centresCreated = 0;

  for (const spec of centres) {
    let centre = await Centre.findOne({ name: spec.name });
    if (!centre) {
      centre = await Centre.create({ ...spec, createdBy: admin._id });
      centresCreated += 1;
    }
    centreDocs.push(centre);
  }

  // ---- slots -------------------------------------------------------------
  let slotsCreated = 0;

  for (const centre of centreDocs) {
    const dayCount = centre.status === CENTRE_STATUS.ACTIVE ? 5 : 2;

    for (let dayOffset = 0; dayOffset < dayCount; dayOffset += 1) {
      const date = addDays(dayOffset);

      for (const [startTime, endTime] of timeBlocks) {
        const exists = await Slot.findOne({ centre: centre._id, date, startTime });
        if (exists) continue;

        await Slot.create({
          centre: centre._id,
          date,
          startTime,
          endTime,
          maxBookings: 20,
          bookedCount: 0,
          status: centre.status === CENTRE_STATUS.ACTIVE ? SLOT_STATUS.ACTIVE : SLOT_STATUS.CLOSED,
          createdBy: admin._id,
        });
        slotsCreated += 1;
      }
    }
  }

  // ---- one sample booking so the dashboards are not empty ----------------
  let bookingsCreated = 0;
  const farmer = userDocs['9876543210'];
  const sampleSlot = await Slot.findOne({
    centre: centreDocs[0]._id,
    status: SLOT_STATUS.ACTIVE,
  }).sort({ date: 1, startTime: 1 });

  if (sampleSlot && !(await Booking.findOne({ farmer: farmer._id, slot: sampleSlot._id }))) {
    const year = new Date().getFullYear();
    const sequence = await Counter.next(`booking:${year}`);
    await Booking.create({
      reference: `KP-${year}-${1000 + sequence}`,
      farmer: farmer._id,
      centre: centreDocs[0]._id,
      slot: sampleSlot._id,
      date: sampleSlot.date,
      startTime: sampleSlot.startTime,
      endTime: sampleSlot.endTime,
      status: BOOKING_STATUS.CONFIRMED,
    });
    await Slot.updateOne({ _id: sampleSlot._id }, { $inc: { bookedCount: 1 } });
    bookingsCreated += 1;
  }

  const summary = { usersCreated, centresCreated, slotsCreated, bookingsCreated };
  log(
    `[seed] users +${usersCreated}, centres +${centresCreated}, slots +${slotsCreated}, bookings +${bookingsCreated}`,
  );
  return summary;
}

export default seedDatabase;
