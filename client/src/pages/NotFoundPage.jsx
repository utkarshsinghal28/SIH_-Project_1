import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Button from '../components/ui/Button.jsx';
import paths from '../routes/paths.js';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 text-center">
      <p className="text-5xl font-bold text-brand-800">404</p>
      <h1 className="mt-3 text-xl font-bold text-slate-900">This page does not exist</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        The page you requested could not be found. It may have been moved, or the address may be
        mistyped.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button to={paths.home}>Go to home page</Button>
        <Button to={paths.farmerLogin} variant="secondary">
          Farmer login
        </Button>
      </div>
      <Link to={paths.adminLogin} className="mt-4 text-sm font-medium text-slate-600 underline">
        Administration login
      </Link>
    </div>
  );
}
