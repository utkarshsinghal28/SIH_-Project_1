import { Route, Routes } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout.jsx';
import FarmerLayout from '../layouts/FarmerLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { ROLES } from '../utils/constants.js';

import LandingPage from '../pages/LandingPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

import FarmerRegisterPage from '../pages/auth/FarmerRegisterPage.jsx';
import FarmerLoginPage from '../pages/auth/FarmerLoginPage.jsx';
import AdminLoginPage from '../pages/auth/AdminLoginPage.jsx';

import FarmerDashboardPage from '../pages/farmer/FarmerDashboardPage.jsx';
import CentreListPage from '../pages/farmer/CentreListPage.jsx';
import CentreDetailsPage from '../pages/farmer/CentreDetailsPage.jsx';
import CentreSlotsPage from '../pages/farmer/CentreSlotsPage.jsx';
import MyBookingsPage from '../pages/farmer/MyBookingsPage.jsx';
import BookingDetailsPage from '../pages/farmer/BookingDetailsPage.jsx';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import AdminCentresPage from '../pages/admin/AdminCentresPage.jsx';
import AdminCentreFormPage from '../pages/admin/AdminCentreFormPage.jsx';
import AdminCentreSlotsPage from '../pages/admin/AdminCentreSlotsPage.jsx';
import AdminBookingsPage from '../pages/admin/AdminBookingsPage.jsx';
import AdminCentreBookingsPage from '../pages/admin/AdminCentreBookingsPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------------------------------------------------------- public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/farmer/register" element={<FarmerRegisterPage />} />
        <Route path="/farmer/login" element={<FarmerLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>

      {/* ---------------------------------------------------------- farmer */}
      <Route element={<ProtectedRoute role={ROLES.FARMER} />}>
        <Route element={<FarmerLayout />}>
          <Route path="/farmer/dashboard" element={<FarmerDashboardPage />} />
          <Route path="/farmer/centres" element={<CentreListPage />} />
          <Route path="/farmer/centres/:id" element={<CentreDetailsPage />} />
          <Route path="/farmer/centres/:id/slots" element={<CentreSlotsPage />} />
          <Route path="/farmer/bookings" element={<MyBookingsPage />} />
          <Route path="/farmer/bookings/:id" element={<BookingDetailsPage />} />
        </Route>
      </Route>

      {/* ----------------------------------------------------------- admin */}
      <Route element={<ProtectedRoute role={ROLES.ADMIN} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/centres" element={<AdminCentresPage />} />
          <Route path="/admin/centres/new" element={<AdminCentreFormPage mode="create" />} />
          <Route path="/admin/centres/:id/edit" element={<AdminCentreFormPage mode="edit" />} />
          <Route path="/admin/centres/:id/slots" element={<AdminCentreSlotsPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/centres/:id/bookings" element={<AdminCentreBookingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
