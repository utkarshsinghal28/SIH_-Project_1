/** Single source of truth for every route path in the application. */
export const paths = {
  home: '/',

  farmerRegister: '/farmer/register',
  farmerLogin: '/farmer/login',
  adminLogin: '/admin/login',

  farmerDashboard: '/farmer/dashboard',
  farmerCentres: '/farmer/centres',
  farmerCentre: (id = ':id') => `/farmer/centres/${id}`,
  farmerCentreSlots: (id = ':id') => `/farmer/centres/${id}/slots`,
  farmerBookings: '/farmer/bookings',
  farmerBooking: (id = ':id') => `/farmer/bookings/${id}`,

  adminDashboard: '/admin/dashboard',
  adminCentres: '/admin/centres',
  adminCentreNew: '/admin/centres/new',
  adminCentreEdit: (id = ':id') => `/admin/centres/${id}/edit`,
  adminCentreSlots: (id = ':id') => `/admin/centres/${id}/slots`,
  adminBookings: '/admin/bookings',
  adminCentreBookings: (id = ':id') => `/admin/centres/${id}/bookings`,
};

export default paths;
