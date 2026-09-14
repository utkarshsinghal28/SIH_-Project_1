import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { CENTRE_STATUS } from '../../utils/constants.js';
import paths from '../../routes/paths.js';

export default function CentreCard({ centre }) {
  const isActive = centre.status === CENTRE_STATUS.ACTIVE;

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">
          <Link to={paths.farmerCentre(centre.id)} className="hover:underline">
            {centre.name}
          </Link>
        </h3>
        <StatusBadge status={centre.status} size="sm" />
      </div>

      <p className="mt-2 text-sm text-slate-600">{centre.address}</p>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">District</dt>
          <dd className="text-slate-800">{centre.district}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">State</dt>
          <dd className="text-slate-800">{centre.state}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Button to={paths.farmerCentre(centre.id)} variant="secondary" size="sm">
          View details
        </Button>
        <Button
          to={isActive ? paths.farmerCentreSlots(centre.id) : undefined}
          size="sm"
          disabled={!isActive}
          title={isActive ? undefined : 'This centre is currently not operating'}
        >
          View slots
        </Button>
      </div>
    </article>
  );
}
