import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import Footer from '../components/layout/Footer.jsx';
import paths from '../routes/paths.js';

const navLinks = [
  { to: paths.adminDashboard, label: 'Dashboard', end: true },
  { to: paths.adminCentres, label: 'Centres' },
  { to: paths.adminBookings, label: 'Bookings' },
];

const sidebarLinks = [
  { to: paths.adminDashboard, label: 'Dashboard', icon: '▦', end: true },
  { to: paths.adminCentres, label: 'Procurement centres', icon: '🏢' },
  { to: paths.adminCentreNew, label: 'Add new centre', icon: '＋' },
  { to: paths.adminBookings, label: 'All bookings', icon: '🧾' },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <a href="#main" className="k-skip-link">
        Skip to main content
      </a>
      <Navbar links={navLinks} variant="admin" />
      <div className="flex flex-1">
        <Sidebar links={sidebarLinks} title="Operations" />
        <main id="main" className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
