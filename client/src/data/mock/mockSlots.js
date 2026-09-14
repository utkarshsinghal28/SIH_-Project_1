import { SLOT_STATUS } from '../../utils/constants.js';
import { mockCentres } from './mockCentres.js';

/**
 * DEVELOPMENT-ONLY slot generator.
 *
 * Slots are generated relative to "today" so the Part 1 demo never shows an
 * empty calendar. Part 2 stores real slot documents created by admins.
 */
const TIME_BLOCKS = [
  ['09:00', '10:00'],
  ['10:00', '11:00'],
  ['11:00', '12:00'],
  ['14:00', '15:00'],
  ['15:00', '16:00'],
];

function addDays(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Deterministic pseudo-random so re-seeding is stable within a session. */
function seededInt(seed, max) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }
  return hash % max;
}

export function buildMockSlots() {
  const slots = [];

  mockCentres.forEach((centre) => {
    const dayCount = centre.status === 'ACTIVE' ? 5 : 2;

    for (let dayOffset = 0; dayOffset < dayCount; dayOffset += 1) {
      const date = addDays(dayOffset);

      TIME_BLOCKS.forEach(([startTime, endTime], blockIndex) => {
        const id = `slt_${centre.id}_${dayOffset}_${blockIndex}`;
        const maxBookings = 15 + seededInt(id, 3) * 5;
        const bookedCount = seededInt(`${id}_b`, maxBookings + 1);

        let status = SLOT_STATUS.ACTIVE;
        if (centre.status === 'INACTIVE') status = SLOT_STATUS.CLOSED;
        else if (bookedCount >= maxBookings) status = SLOT_STATUS.FULL;
        else if (blockIndex === 4 && dayOffset === 0) status = SLOT_STATUS.CLOSED;

        slots.push({
          id,
          centreId: centre.id,
          date,
          startTime,
          endTime,
          maxBookings,
          bookedCount: Math.min(bookedCount, maxBookings),
          status,
        });
      });
    }
  });

  return slots;
}
