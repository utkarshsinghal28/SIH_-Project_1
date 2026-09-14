import { useCallback, useMemo, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import CentreCard from '../../components/centres/CentreCard.jsx';
import CentreFilters from '../../components/centres/CentreFilters.jsx';
import DataState from '../../components/common/DataState.jsx';
import Button from '../../components/ui/Button.jsx';
import useAsync from '../../hooks/useAsync.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { listCentres } from '../../services/centreService.js';

const EMPTY_FILTERS = { search: '', district: '', state: '', status: '' };

export default function CentreListPage() {
  useDocumentTitle('Procurement centres');

  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // The full list is fetched once; filtering runs client-side for instant feedback.
  // The service already accepts the same filters as query params, so Part 2 can
  // switch to server-side filtering without touching this page's markup.
  const fetcher = useCallback(() => listCentres(), []);
  const { data, loading, error, reload } = useAsync(fetcher, []);

  const centres = useMemo(() => data ?? [], [data]);

  const states = useMemo(
    () => [...new Set(centres.map((centre) => centre.state))].sort(),
    [centres],
  );

  const districts = useMemo(() => {
    const pool = filters.state
      ? centres.filter((centre) => centre.state === filters.state)
      : centres;
    return [...new Set(pool.map((centre) => centre.district))].sort();
  }, [centres, filters.state]);

  const visible = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return centres.filter((centre) => {
      if (filters.state && centre.state !== filters.state) return false;
      if (filters.district && centre.district !== filters.district) return false;
      if (filters.status && centre.status !== filters.status) return false;
      if (!search) return true;
      return (
        centre.name.toLowerCase().includes(search) ||
        centre.address.toLowerCase().includes(search) ||
        centre.district.toLowerCase().includes(search)
      );
    });
  }, [centres, filters]);

  const handleChange = (next) => {
    setFilters(next.state !== filters.state ? { ...next, district: '' } : next);
  };

  return (
    <>
      <PageHeader
        title="Procurement centres"
        subtitle="Find a centre near you and check the slots it has opened."
        breadcrumbs={[{ label: 'Dashboard', to: '/farmer/dashboard' }, { label: 'Centres' }]}
      />

      <CentreFilters
        values={filters}
        onChange={handleChange}
        onReset={() => setFilters(EMPTY_FILTERS)}
        districts={districts}
        states={states}
        statuses={[
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' },
        ]}
        resultCount={loading ? undefined : visible.length}
      />

      <div className="mt-5">
        <DataState
          loading={loading}
          error={error}
          onRetry={reload}
          isEmpty={visible.length === 0}
          loadingLabel="Loading procurement centres…"
          errorTitle="Could not load procurement centres"
          emptyIcon="🔍"
          emptyTitle="No centres match your filters"
          emptyMessage="Try a different district or state, or clear the filters to see every centre."
          emptyAction={
            <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear filters
            </Button>
          }
        >
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((centre) => (
              <li key={centre.id}>
                <CentreCard centre={centre} />
              </li>
            ))}
          </ul>
        </DataState>
      </div>
    </>
  );
}
