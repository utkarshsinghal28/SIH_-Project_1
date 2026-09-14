import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import paths from '../routes/paths.js';

const links = [
  { to: paths.farmerDashboard, label: 'Dashboard', end: true },
  { to: paths.farmerCentres, label: 'Procurement centres' },
  { to: paths.farmerBookings, label: 'My bookings' },
];

export default function FarmerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <a href="#main" className="k-skip-link">
        Skip to main content
      </a>
      <Navbar links={links} variant="farmer" />
      <main id="main" className="flex-1">
        <div className="k-container py-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
