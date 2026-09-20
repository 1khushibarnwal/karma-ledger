/**
 * The KarmaLedger mark: an assay hallmark — the small stamp struck into precious
 * metal to certify it. Same idea as a soulbound score: a permanent mark, made
 * once, that can't be peeled off and put on something else.
 */
export default function Mark({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 2.5 27.5 9v14L16 29.5 4.5 23V9L16 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* The struck glyph inside: a commit node branching into the chain. */}
      <path
        d="M12 21V11M12 11a2.6 2.6 0 1 0 0-.01M12 15.5h4.4a3.2 3.2 0 0 1 3.2 3.2v2.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19.6" cy="22.6" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}