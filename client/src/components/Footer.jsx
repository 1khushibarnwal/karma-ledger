import { Link } from "react-router-dom";
import Mark from "./Mark";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-muted">
          <Mark className="h-5 w-5" />
          <span className="font-body text-sm">
            Reputation you can prove to a contract, not just show in a screenshot.
          </span>
        </div>
        <div className="flex gap-5 font-body text-sm text-muted">
          <Link to="/how-it-works" className="transition-colors hover:text-ivory">
            How it works
          </Link>
          <Link to="/faq" className="transition-colors hover:text-ivory">
            FAQ
          </Link>
          <Link to="/ledger" className="transition-colors hover:text-ivory">
            Ledger
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-10">
        <p className="font-mono text-xs text-muted">
          Built for Hack Devengers 2.0 — MERN, logistic regression, soulbound ERC-721.
        </p>
      </div>
    </footer>
  );
}