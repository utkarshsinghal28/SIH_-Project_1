import { BOOKING_STATUS } from '../../utils/constants.js';

/**
 * DEVELOPMENT-ONLY seed bookings so "My bookings" and the admin tables are not
 * empty on first load. Part 2 persists real bookings in MongoDB.
 */
export function buildMockBookings(slots) {
  const byCentre = (centreId) => slots.filter((slot) => slot.centreId === centreId);

  const satara = byCentre('ctr_001');
  const karad = byCentre('ctr_002');
  const hazaribagh = byCentre('ctr_004');

  const seeds = [
    { slot: satara[1], farmerId: 'usr_farmer_001', status: BOOKING_STATUS.CONFIRMED },
    { slot: karad[7], farmerId: 'usr_farmer_001', status: BOOKING_STATUS.CONFIRMED },
    { slot: satara[3], farmerId: 'usr_farmer_001', status: BOOKING_STATUS.CANCELLED },
    { slot: hazaribagh[2], farmerId: 'usr_farmer_002', status: BOOKING_STATUS.CONFIRMED },
    { slot: hazaribagh[6], farmerId: 'usr_farmer_002', status: BOOKING_STATUS.CANCELLED },
  ];

  return seeds
    .filter((seed) => Boolean(seed.slot))
    .map((seed, index) => ({
      id: `bkg_seed_${index + 1}`,
      reference: `KP-2026-${String(1001 + index)}`,
      farmerId: seed.farmerId,
      centreId: seed.slot.centreId,
      slotId: seed.slot.id,
      date: seed.slot.date,
      startTime: seed.slot.startTime,
      endTime: seed.slot.endTime,
      status: seed.status,
      createdAt: new Date(Date.now() - (index + 1) * 36e5).toISOString(),
    }));
}
