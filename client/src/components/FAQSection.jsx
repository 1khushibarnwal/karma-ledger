import { useState } from "react";

const FAQS = [
  {
    q: "What does the badge actually let me do right now?",
    a: "Honestly — nothing on its own yet. No other app currently reads it. It's a verifiable, portable record, not yet an ecosystem. What consumes that record (grant screening, DAO contributor tiers, hiring) is the next layer, and deliberately out of scope for this build.",
  },
  {
    q: "Isn't this just trusting your backend instead of a screenshot?",
    a: "Partially, yes. The signature only proves \"KarmaChain's scoring service said this score, for this user, at this time\" — it doesn't prove the score is objectively correct. What it removes is the ability to fake or alter that claim after the fact, or attach it to the wrong wallet. That's strictly less trust than a screenshot, even though it isn't zero trust.",
  },
  {
    q: "Can someone inflate their score by gaming GitHub activity?",
    a: "To some extent — you could always automate commits. The model deliberately weights sustained, deep activity (project depth, consistency) far higher than raw commit count, specifically to make this more expensive to fake convincingly than a one-time sprint of low-effort commits. It's a deterrent, not a guarantee.",
  },
  {
    q: "Why use a blockchain at all — why not just a database?",
    a: "A database row proves a claim only to systems that trust your server to check it. A public on-chain record can be verified independently by anyone with an RPC connection, forever, even if this backend disappears entirely. That permissionless verifiability is the value blockchain adds here.",
  },
  {
    q: "Can the badge be sold or transferred?",
    a: "No, by design. Every transfer and approval path reverts on-chain. Reputation that could be sold or gifted would defeat the entire point of the project.",
  },
  {
    q: "What happens when my GitHub activity changes?",
    a: "Re-run the scoring and minting flow — it updates your existing badge's score in place rather than minting a second one. You'll always hold exactly one Karma token per wallet.",
  },
  {
    q: "Who is the \"trusted signer,\" and what stops them from cheating?",
    a: "It's a single backend-controlled wallet, hardcoded into the contract at deploy time. Today, that's a real centralization point. A production version would want this to be a multisig or a verifiable off-chain computation rather than one server's key.",
  },
  {
    q: "Is this actually decentralized?",
    a: "Partially. The ledger — who holds what score — is fully decentralized and independently verifiable. The scoring is not; it depends on one backend today. That's an honest trade-off for this build, not a claim of full decentralization.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(i) {
    setOpenIndex((prev) => (prev === i ? null : i));
  }

  return (
    <section>
      <div className="overflow-hidden rounded-xl border border-hairline shadow-card">
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`bg-surface ${i !== FAQS.length - 1 ? "border-b border-hairline/60" : ""}`}
            >
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface2"
                aria-expanded={isOpen}
              >
                <span className="font-body text-sm font-semibold text-ivory pr-4">
                  {item.q}
                </span>
                <span
                  className={`shrink-0 font-mono text-signal transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 font-body text-sm leading-relaxed text-muted">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}