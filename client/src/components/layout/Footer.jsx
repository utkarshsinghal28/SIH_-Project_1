import { APP_NAME } from '../../utils/constants.js';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="k-container py-6">
        <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-slate-800">{APP_NAME}</p>
          <p>Smart India Hackathon 2026 · Prototype</p>
        </div>
        <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Development build — <strong>Parts 1 &amp; 2 complete</strong> (interface, REST API,
          MongoDB persistence, JWT authentication). Real-time queue operations, check-in and
          payment tracking are delivered in Part 3.
        </p>
      </div>
    </footer>
  );
}
