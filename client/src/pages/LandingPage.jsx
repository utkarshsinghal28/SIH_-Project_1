import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Button from '../components/ui/Button.jsx';
import paths from '../routes/paths.js';
import { APP_TAGLINE } from '../utils/constants.js';

const PROBLEMS = [
  {
    icon: '⏳',
    title: 'Hours lost waiting',
    text: 'Farmers reach the centre early and wait, because there is no reliable way to know when their turn will actually come.',
  },
  {
    icon: '❓',
    title: 'No visibility of position',
    text: 'Once at the centre, there is little clarity on how many people are ahead or how long the remaining wait will be.',
  },
  {
    icon: '🚜',
    title: 'Crowding at peak hours',
    text: 'Everyone arrives at the same time, so counters are idle in some hours and overwhelmed in others.',
  },
  {
    icon: '💰',
    title: 'Unclear payment status',
    text: 'After procurement is completed, farmers often have to follow up repeatedly to learn the status of their payment.',
  },
];

const STEPS = [
  { n: 1, title: 'Register', text: 'Create an account with your mobile number and village details.' },
  { n: 2, title: 'Book a procurement slot', text: 'Choose a nearby centre, pick a date and a time slot that suits you.' },
  { n: 3, title: 'Track your position', text: 'Follow your place in the queue instead of standing in it.' },
  { n: 4, title: 'Arrive when needed', text: 'Travel to the centre close to your actual turn, not hours before it.' },
  { n: 5, title: 'Complete procurement', text: 'Get your produce weighed and recorded at the counter.' },
  { n: 6, title: 'Track payment', text: 'Follow the procurement and payment status from your phone.' },
];

const ROADMAP = [
  {
    phase: 'Part 1',
    state: 'Available now',
    tone: 'bg-brand-100 text-brand-900 border-brand-300',
    items: ['Farmer & admin interfaces', 'Centre discovery and filters', 'Slot booking screens', 'Booking records UI'],
  },
  {
    phase: 'Part 2',
    state: 'Planned',
    tone: 'bg-slate-100 text-slate-700 border-slate-300',
    items: ['Express REST API', 'MongoDB persistence', 'JWT authentication & RBAC', 'Atomic slot capacity handling'],
  },
  {
    phase: 'Part 3',
    state: 'Planned',
    tone: 'bg-slate-100 text-slate-700 border-slate-300',
    items: ['Check-in at the centre', 'Live queue position & waiting time', 'Arrival recommendations', 'Procurement & payment tracking'],
  },
];

export default function LandingPage() {
  useDocumentTitle('Smarter Procurement. Less Waiting.');

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="border-b border-slate-200 bg-brand-800 text-white">
        <div className="k-container grid gap-8 py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Agricultural procurement centres
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {APP_TAGLINE}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-50 sm:text-lg">
              A farmer should not have to spend hours physically waiting at a procurement centre
              simply to find out when their turn will arrive. This platform lets farmers book a
              procurement slot in advance, and gives centre staff the tools to plan the day.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button to={paths.farmerRegister} size="lg" variant="secondary">
                Register as a farmer
              </Button>
              <Button
                to={paths.farmerLogin}
                size="lg"
                className="border border-white/50 bg-transparent text-white hover:bg-white/10"
              >
                Farmer sign in
              </Button>
            </div>

            <p className="mt-4 text-sm text-brand-100">
              Procurement centre staff can sign in from the{' '}
              <Link to={paths.adminLogin} className="font-semibold text-white underline">
                administration portal
              </Link>
              .
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-lg border border-white/20 bg-white/10 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-brand-100">
                What this platform coordinates
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  'Advance booking of procurement time slots',
                  'Centre-wise capacity visible before travelling',
                  'One booking reference for the entire process',
                  'A shared operational view for centre staff',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="text-brand-200">
                      ✔
                    </span>
                    <span className="text-brand-50">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-md bg-brand-900/60 px-3 py-2 text-xs leading-relaxed text-brand-100">
                Prototype notice: this build is <strong className="text-white">Part 1</strong> — the
                complete interface. Server-side APIs, storage and live queue operations follow in
                Parts 2 and 3.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- problem */}
      <section className="bg-white">
        <div className="k-container py-12">
          <h2 className="text-2xl font-bold text-slate-900">The problem we are addressing</h2>
          <p className="mt-2 max-w-3xl text-slate-600">
            Procurement season concentrates a very large number of farmers into a small number of
            working hours. The result is long physical queues, unpredictable waiting and repeated
            trips.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROBLEMS.map((problem) => (
              <article
                key={problem.title}
                className="rounded-lg border border-slate-200 bg-slate-50 p-5"
              >
                <span aria-hidden="true" className="text-2xl">
                  {problem.icon}
                </span>
                <h3 className="mt-3 text-base font-semibold text-slate-900">{problem.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{problem.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- solution */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="k-container py-12">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <p className="mt-2 max-w-3xl text-slate-600">
            Six simple steps, designed to be understood without any technical background.
          </p>

          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-base font-bold text-white">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------- differentiation */}
      <section className="bg-white">
        <div className="k-container grid gap-8 py-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              The coordination layer between booking and the counter
            </h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Booking a slot is only half the problem. The waiting happens after the farmer reaches
              the centre. Our focus is the operational layer that connects the digital booking to
              what is actually happening at the physical procurement centre — check-in, live queue
              position, counter capacity and realistic arrival guidance.
            </p>
            <p className="mt-3 leading-relaxed text-slate-600">
              That real-time operational layer is the goal of Part 3. This Part 1 build establishes
              the interface, the workflows and the API contract it will run on.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
              Development roadmap
            </h3>
            <div className="mt-4 space-y-4">
              {ROADMAP.map((entry) => (
                <div key={entry.phase} className="rounded-md border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{entry.phase}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${entry.tone}`}
                    >
                      {entry.state}
                    </span>
                  </div>
                  <ul className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                    {entry.items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="border-t border-slate-200 bg-govt-900 text-white">
        <div className="k-container flex flex-col items-start gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Ready to book your procurement slot?</h2>
            <p className="mt-1 text-sm text-slate-300">
              Registration takes less than two minutes and needs only your mobile number.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button to={paths.farmerRegister} size="lg">
              Register now
            </Button>
            <Button
              to={paths.farmerLogin}
              size="lg"
              className="border border-white/50 bg-transparent text-white hover:bg-white/10"
            >
              I already have an account
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
