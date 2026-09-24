import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ThemeToggle from "./ThemeToggle";
import Mark from "./Mark";

const LINKS = [
  { to: "/score", label: "Score a profile" },
  { to: "/ledger", label: "Ledger" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/docs", label: "Docs" },
  { to: "/faq", label: "FAQ" },
];

function linkClass({ isActive }) {
  return [
    "relative py-1 text-sm transition-colors",
    isActive ? "text-ivory" : "text-muted hover:text-ivory",
    // The active page is marked with a struck underline rather than a pill,
    // matching the engraved language of the rest of the UI.
    isActive
      ? "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:bg-signal"
      : "",
  ].join(" ");
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile sheet on navigation, otherwise it covers the new page.
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-ivory transition-colors hover:text-signal"
        >
          <Mark className="h-7 w-7 text-signal" />
          <span className="font-display text-base font-semibold tracking-tight">KarmaLedger</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />
          <div className="hidden sm:block">
            <ConnectButton
              showBalance={false}
              accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
              chainStatus={{ smallScreen: "icon", largeScreen: "icon" }}
            />
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-lg border border-hairline bg-surface text-muted transition-colors hover:text-ivory md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-hairline bg-surface px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 sm:hidden">
            <ConnectButton showBalance={false} />
          </div>
        </div>
      )}
    </header>
  );
}