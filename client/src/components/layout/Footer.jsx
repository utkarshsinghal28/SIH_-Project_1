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
          Development build — <strong>Part 1 (frontend foundation)</strong>. Backend APIs,
          persistent storage and real-time queue operations are delivered in Parts 2 and 3.
        </p>
      </div>
    </footer>
  );
}
