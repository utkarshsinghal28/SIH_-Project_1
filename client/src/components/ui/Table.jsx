/**
 * Responsive data table.
 *
 * Desktop/tablet: a real <table>.
 * Mobile: the same rows rendered as stacked label/value cards, so admin data is
 * usable on a phone without horizontal scrolling.
 *
 * @param {Array<{key:string,header:string,render?:Function,className?:string,hideOnMobile?:boolean}>} columns
 */
export default function Table({ columns, rows, rowKey = (row) => row.id, caption, onRowClick }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-brand-50' : 'hover:bg-slate-50'}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 align-middle text-slate-800 ${column.className ?? ''}`}
                  >
                    {column.render ? column.render(row) : (row[column.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={rowKey(row)}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <dl className="space-y-2">
              {columns
                .filter((column) => !column.hideOnMobile)
                .map((column) => (
                  <div key={column.key} className="flex items-start justify-between gap-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {column.header}
                    </dt>
                    <dd className="text-right text-sm text-slate-800">
                      {column.render ? column.render(row) : (row[column.key] ?? '—')}
                    </dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
