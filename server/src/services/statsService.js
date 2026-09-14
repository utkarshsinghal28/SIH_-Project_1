import Booking, { BOOKING_STATUS } from '../models/Booking.js';
import Centre, { CENTRE_STATUS } from '../models/Centre.js';
import Slot from '../models/Slot.js';
import User, { ROLES } from '../models/User.js';

/** Today's calendar date in YYYY-MM-DD, matching how slot dates are stored. */
export function todayISO() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Aggregated counters for the admin dashboard. */
export async function getDashboardStats() {
  const today = todayISO();

  const [totalCentres, activeCentres, todaysSlots, registeredFarmers, todaysByStatus] =
    await Promise.all([
      Centre.countDocuments({}),
      Centre.countDocuments({ status: CENTRE_STATUS.ACTIVE }),
      Slot.countDocuments({ date: today }),
      User.countDocuments({ role: ROLES.FARMER }),
      Booking.aggregate([
        { $match: { date: today } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

  const byStatus = Object.fromEntries(todaysByStatus.map((row) => [row._id, row.count]));
  const todaysBookings = Object.values(byStatus).reduce((sum, count) => sum + count, 0);

  return {
    totalCentres,
    activeCentres,
    inactiveCentres: totalCentres - activeCentres,
    todaysSlots,
    todaysBookings,
    confirmedToday: byStatus[BOOKING_STATUS.CONFIRMED] ?? 0,
    cancelledToday: byStatus[BOOKING_STATUS.CANCELLED] ?? 0,
    registeredFarmers,
  };
}

export default { getDashboardStats, todayISO };
