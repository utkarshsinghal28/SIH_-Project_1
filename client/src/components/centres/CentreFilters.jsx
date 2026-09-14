import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Button from '../ui/Button.jsx';

export default function CentreFilters({
  values,
  onChange,
  onReset,
  districts = [],
  states = [],
  statuses,
  resultCount,
}) {
  const set = (key) => (event) => onChange({ ...values, [key]: event.target.value });

  return (
    <section
      aria-label="Filter procurement centres"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Search"
          name="search"
          type="search"
          placeholder="Centre name, address…"
          value={values.search}
          onChange={set('search')}
          className="sm:col-span-2 lg:col-span-1"
        />
        <Select
          label="State"
          name="state"
          placeholder="All states"
          options={states}
          value={values.state}
          onChange={set('state')}
        />
        <Select
          label="District"
          name="district"
          placeholder="All districts"
          options={districts}
          value={values.district}
          onChange={set('district')}
        />
        {statuses && (
          <Select
            label="Status"
            name="status"
            placeholder="All statuses"
            options={statuses}
            value={values.status}
            onChange={set('status')}
          />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600" aria-live="polite">
          {typeof resultCount === 'number'
            ? `${resultCount} ${resultCount === 1 ? 'centre' : 'centres'} found`
            : ''}
        </p>
        <Button variant="secondary" size="sm" onClick={onReset}>
          Clear filters
        </Button>
      </div>
    </section>
  );
}
