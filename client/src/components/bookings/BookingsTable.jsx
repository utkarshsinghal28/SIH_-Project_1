import Table from '../ui/Table.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { formatDate, formatTimeRange } from '../../utils/format.js';

/** Shared admin bookings table (all bookings + centre-specific bookings). */
export default function BookingsTable({ bookings, showCentre = true }) {
  const columns = [
    {
      key: 'reference',
      header: 'Reference',
      render: (row) => <span className="font-mono font-semibold">{row.reference}</span>,
    },
    {
      key: 'farmer',
      header: 'Farmer',
      render: (row) => (
        <span>
          <span className="block font-medium text-slate-900">{row.farmerName}</span>
          <span className="block text-xs text-slate-500">{row.farmerPhone}</span>
        </span>
      ),
    },
    ...(showCentre
      ? [
          {
            key: 'centreName',
            header: 'Centre',
            render: (row) => (
              <span>
                <span className="block">{row.centreName}</span>
                <span className="block text-xs text-slate-500">{row.centreDistrict}</span>
              </span>
            ),
          },
        ]
      : []),
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    {
      key: 'slot',
      header: 'Slot',
      render: (row) => formatTimeRange(row.startTime, row.endTime),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
  ];

  return <Table columns={columns} rows={bookings} caption="Procurement bookings" />;
}
