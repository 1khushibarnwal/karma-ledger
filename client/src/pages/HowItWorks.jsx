import { Link } from "react-router-dom";
import DifferentiationSection from "../components/DifferentiationSection";

const FEATURES = [
  {
    name: "Commit frequency",
    detail: "How often commits have been pushed recently.",
  },
  {
    name: "Language diversity",
    detail: "How many distinct languages appear across the developer's repositories.",
  },
  {
    name: "Project depth",
    detail: "Average commits per repository — rewards sustained work over one-off repos.",
  },
  {
    name: "Community signal",
    detail: "Followers and stars received, log-scaled so it can't dominate the score alone.",
  },
  {
    name: "Consistency streak",
    detail: "Longest run of consecutive active days in recent activity.",
  },
];

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
        How it works
      </h1>
      <p className="mt-3 max-w-[62ch] font-body text-base leading-relaxed text-muted">
        Nothing here is hidden. The score comes from five public signals, the weighting
        comes from a trained model, and the badge comes from a signature tied to one wallet.
      </p>

      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold text-ivory">What gets measured</h2>
        <dl className="mt-6 overflow-hidden rounded-xl border border-hairline">
          {FEATURES.map((f, i) => (
            <div
              key={f.name}
              className={`grid gap-1 bg-surface px-6 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6 ${
                i !== FEATURES.length - 1 ? "border-b border-hairline/60" : ""
              }`}
            >
              <dt className="font-body text-sm font-semibold text-ivory">{f.name}</dt>
              <dd className="font-body text-sm leading-relaxed text-muted">{f.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 max-w-[62ch] font-body text-sm leading-relaxed text-muted">
          Each contribution is shown on the score card, so you can see which signal moved
          the number rather than trusting a total.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-xl font-semibold text-ivory">
          What happens when you mint
        </h2>
        <ol className="mt-6 space-y-4">
          {[
            "The backend recomputes the score and signs it together with your wallet address and a one-time nonce.",
            "Your wallet submits that signature to the KarmaChain contract.",
            "The contract verifies the signature came from the trusted signer, then mints or updates your single badge.",
            "Transfers and approvals revert permanently, so the badge stays with the wallet that earned it.",
          ].map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="mt-0.5 font-mono text-sm text-signal">{i + 1}</span>
              <span className="font-body text-sm leading-relaxed text-muted">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-16">
        <DifferentiationSection />
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <Link
          to="/score"
          className="rounded-lg bg-gold px-6 py-3 font-display font-semibold text-surface transition-opacity hover:opacity-90"
        >
          Score a profile
        </Link>
        <Link
          to="/faq"
          className="rounded-lg border border-hairline px-6 py-3 font-display font-semibold text-ivory transition-colors hover:border-signal/50 hover:text-signal"
        >
          Read the honest caveats
        </Link>
      </div>
    </div>
  );
}