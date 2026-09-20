import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-28 text-center">
      <div className="font-mono text-sm text-signal">404</div>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ivory">
        Nothing is recorded at this address
      </h1>
      <p className="mx-auto mt-3 max-w-[52ch] font-body text-base leading-relaxed text-muted">
        The page you asked for doesn't exist. The ledger and the scorer are both still here.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-lg bg-gold px-6 py-3 font-display font-semibold text-surface transition-opacity hover:opacity-90"
        >
          Back to the start
        </Link>
        <Link
          to="/ledger"
          className="rounded-lg border border-hairline px-6 py-3 font-display font-semibold text-ivory transition-colors hover:border-signal/50 hover:text-signal"
        >
          View the ledger
        </Link>
      </div>
    </div>
  );
}