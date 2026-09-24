import { useState } from "react";
import { Link } from "react-router-dom";

/* ----------------------------------------------------------------------- *
 * A plain-language guide for anyone using the app — not just developers.
 * No jargon left unexplained: every web3 term used elsewhere in the app
 * (wallet, gas, mint, soulbound, testnet...) gets defined here in one place.
 * ----------------------------------------------------------------------- */

const TIERS = [
  { name: "Bronze", range: "0–399", color: "text-bronze", border: "border-bronze/60" },
  { name: "Silver", range: "400–599", color: "text-silver", border: "border-silver/60" },
  { name: "Gold", range: "600–799", color: "text-gold", border: "border-gold/60" },
  { name: "Platinum", range: "800–1000", color: "text-platinum", border: "border-platinum/60" },
];

const STEPS = [
  {
    title: "Look up a GitHub profile",
    body: "Type any public GitHub username into the search box on the Score page — yours, or anyone else's. No account or wallet needed for this part; it's free to look up as many profiles as you like.",
  },
  {
    title: "Add a Codeforces handle (optional)",
    body: "If you compete on Codeforces, add your handle too. It adds a small bonus on top of your GitHub score. Skip it and nothing changes — your score just comes from GitHub alone.",
  },
  {
    title: "Read your score",
    body: "You'll get a number from 0–1000 and a tier — Bronze, Silver, Gold, or Platinum. Underneath, a breakdown shows exactly which parts of your GitHub activity contributed, so it's never a mystery number.",
  },
  {
    title: "Connect a wallet",
    body: "Only needed if you want to keep the badge permanently. Click \"Connect Wallet\" and choose an app you already have, like MetaMask. This app never asks for a seed phrase or private key — only a connection request, which you approve inside your own wallet app.",
  },
  {
    title: "Mint the badge",
    body: "One click, then your wallet asks you to confirm a transaction. Confirming records your score permanently on the Sepolia test network. This step needs a small amount of test ETH for gas (see the Wallets & Gas section) — real money is never involved.",
  },
];

const GLOSSARY = [
  { term: "Wallet", def: "An app (like MetaMask) that holds your crypto identity and lets you approve blockchain actions. Think of it as your login and your signature, combined." },
  { term: "On-chain", def: "Stored permanently on a public blockchain, instead of in one company's private database. Anyone can look it up, and no single company can quietly edit or delete it." },
  { term: "Mint", def: "The action of permanently recording something — here, your score — on the blockchain for the first time (or updating it later)." },
  { term: "Soulbound", def: "This badge can't be sold, traded, or given to someone else. It's permanently tied to the wallet that minted it, the same way a diploma can't be handed off to a stranger." },
  { term: "Gas", def: "A small fee paid to the network to process a transaction, similar to a card processing fee. It goes to the network, not to KarmaLedger." },
  { term: "Testnet (Sepolia)", def: "A practice version of the Ethereum network. Everything works the same way as \"real\" Ethereum, but the ETH used has no real-world value — it's free to get from a faucet, so minting here costs you nothing real." },
  { term: "Signature", def: "Cryptographic proof that a specific action came from your wallet, without ever revealing your private key. Signing is safe; it's different from sending funds." },
  { term: "Tier", def: "A named range your score falls into — Bronze, Silver, Gold, or Platinum — so a score is easy to read at a glance." },
];

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      {eyebrow && (
        <div className="font-mono text-xs uppercase tracking-widest text-signal">{eyebrow}</div>
      )}
      <h2 className="mt-1 font-display text-2xl font-semibold text-ivory">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function GlossaryItem({ term, def }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-hairline/60 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface2"
        aria-expanded={open}
      >
        <span className="font-body text-sm font-semibold text-ivory">{term}</span>
        <span className={`shrink-0 font-mono text-signal transition-transform duration-200 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`grid transition-all duration-200 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <p className="px-5 pb-4 font-body text-sm leading-relaxed text-muted">{def}</p>
        </div>
      </div>
    </div>
  );
}

const TOC = [
  ["what-is-this", "What is KarmaLedger"],
  ["how-scoring-works", "How your score is calculated"],
  ["walkthrough", "Using the app, step by step"],
  ["wallets-and-gas", "Wallets & gas, in plain terms"],
  ["is-it-safe", "Is this safe?"],
  ["common-issues", "Common issues"],
  ["glossary", "Glossary"],
];

export default function Docs() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
        Docs
      </h1>
      <p className="mt-3 max-w-[62ch] font-body text-base leading-relaxed text-muted">
        Everything about KarmaLedger, explained without assuming you already know web3. If
        you just want the short technical rundown, see{" "}
        <Link to="/how-it-works" className="text-signal underline decoration-dotted underline-offset-4">
          How it works
        </Link>
        . If you're stuck on something specific, jump straight to it below.
      </p>

      {/* Table of contents */}
      <nav className="mt-8 flex flex-wrap gap-2">
        {TOC.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full border border-hairline bg-surface px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-signal/60 hover:text-ivory"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-16 flex flex-col gap-16">
        <Section id="what-is-this" eyebrow="Start here" title="What is KarmaLedger?">
          <p className="max-w-[62ch] font-body text-sm leading-relaxed text-muted">
            KarmaLedger turns your public GitHub activity into a single number — a{" "}
            <strong className="text-ivory">Karma Score</strong> from 0 to 1000 — and lets you
            record that score permanently on a blockchain as a badge. Optionally, a Codeforces
            handle adds a small bonus on top, since competitive-programming ratings can't be
            faked or bought the way follower counts can.
          </p>
          <p className="mt-4 max-w-[62ch] font-body text-sm leading-relaxed text-muted">
            The point is portability and proof. A number on a website is easy to fake in a
            screenshot. A badge recorded on-chain can be checked by anyone — a recruiter, a
            DAO, another app — without having to trust KarmaLedger's website at all.
          </p>
        </Section>

        <Section id="how-scoring-works" eyebrow="The score" title="How your score is calculated">
          <p className="max-w-[62ch] font-body text-sm leading-relaxed text-muted">
            You don't need to understand machine learning to trust the number — every score
            comes with a visible breakdown. In plain terms, five things about your GitHub
            activity are measured:
          </p>
          <ul className="mt-4 space-y-2 font-body text-sm text-muted">
            <li>• <strong className="text-ivory">How often you commit</strong> — recent, active coding</li>
            <li>• <strong className="text-ivory">How many languages you use</strong> — breadth of skill</li>
            <li>• <strong className="text-ivory">How deep your projects go</strong> — sustained work, not one-off repos</li>
            <li>• <strong className="text-ivory">Followers and stars</strong> — community recognition, kept from dominating the score alone</li>
            <li>• <strong className="text-ivory">Your longest streak</strong> — consistency over time</li>
          </ul>
          <p className="mt-4 max-w-[62ch] font-body text-sm leading-relaxed text-muted">
            These combine into your score, and the score card always shows which of the five
            moved your number and by how much — nothing is hidden inside a black box.
          </p>
          <div className="mt-6 rounded-xl border border-hairline bg-surface p-5">
            <p className="font-body text-sm text-ivory">Tiers, by score:</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {TIERS.map((t) => (
                <span
                  key={t.name}
                  className={`rounded-full border bg-surface2 px-3 py-1 font-mono text-xs ${t.color} ${t.border}`}
                >
                  {t.name} · {t.range}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-4 max-w-[62ch] font-body text-sm leading-relaxed text-muted">
            If you add a Codeforces handle, its rating adds up to 150 extra points on top,
            shown as a separate line — it's never mixed silently into the GitHub-based number.
          </p>
        </Section>

        <Section id="walkthrough" eyebrow="Using the app" title="Step by step">
          <ol className="space-y-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface2 font-mono text-xs text-signal">
                  {i + 1}
                </span>
                <div>
                  <p className="font-body text-sm font-semibold text-ivory">{step.title}</p>
                  <p className="mt-1 max-w-[58ch] font-body text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="wallets-and-gas" eyebrow="New to web3" title="Wallets & gas, in plain terms">
          <p className="max-w-[62ch] font-body text-sm leading-relaxed text-muted">
            If you've never used a crypto wallet before, here's the short version:
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-hairline bg-surface p-5">
              <p className="font-body text-sm font-semibold text-ivory">Getting a wallet</p>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted">
                Install a browser extension like MetaMask (metamask.io) — it's free. It creates
                an address for you, which acts like your username on the blockchain.
              </p>
            </div>
            <div className="rounded-xl border border-hairline bg-surface p-5">
              <p className="font-body text-sm font-semibold text-ivory">Getting test ETH</p>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted">
                Minting happens on Sepolia, a free practice network. Search "Sepolia faucet" to
                get free test ETH — no real money, no card, no purchase, ever.
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-[62ch] font-body text-sm leading-relaxed text-muted">
            When you mint, your wallet will pop up and show you a small "gas fee" — a tiny
            amount of test ETH the network charges to process your transaction. It's not a fee
            KarmaLedger collects.
          </p>
        </Section>

        <Section id="is-it-safe" eyebrow="Trust & safety" title="Is this safe?">
          <div className="space-y-4">
            <div className="rounded-xl border border-hairline bg-surface p-5">
              <p className="font-body text-sm font-semibold text-ivory">We never ask for your seed phrase</p>
              <p className="mt-2 max-w-[58ch] font-body text-sm leading-relaxed text-muted">
                Connecting a wallet only shares your public address, the same as telling
                someone your username. No legitimate app — this one included — will ever ask
                you to type in your seed phrase or private key. If anything ever asks for that,
                it isn't safe, regardless of what it claims to be.
              </p>
            </div>
            <div className="rounded-xl border border-hairline bg-surface p-5">
              <p className="font-body text-sm font-semibold text-ivory">
                Your wallet might warn you before you connect — that's expected
              </p>
              <p className="mt-2 max-w-[58ch] font-body text-sm leading-relaxed text-muted">
                This app is hosted on a shared domain (a free Vercel subdomain) that wallet
                security tools sometimes flag automatically for brand-new sites, since
                scammers also use free subdomains. It doesn't mean this specific page is
                unsafe — just check that the URL in your address bar matches the link you were
                given, then continue.
              </p>
            </div>
            <div className="rounded-xl border border-hairline bg-surface p-5">
              <p className="font-body text-sm font-semibold text-ivory">Everything here is on a test network</p>
              <p className="mt-2 max-w-[58ch] font-body text-sm leading-relaxed text-muted">
                Minting uses Sepolia, not the real Ethereum network — the ETH involved has no
                real-world value. Trying this out can't cost you real money.
              </p>
            </div>
          </div>
        </Section>

        <Section id="common-issues" eyebrow="Troubleshooting" title="Common issues">
          <div className="overflow-hidden rounded-xl border border-hairline">
            {[
              ["My score seems off", "Scores are based on recent public activity, roughly the last few months of events — GitHub's public API doesn't expose your full history, so very old activity may not count."],
              ["The Codeforces bonus isn't showing", "Double-check the handle for typos. An invalid handle never breaks your score — it just stays GitHub-only, silently."],
              ["My wallet won't connect", "Make sure your wallet extension is unlocked and set to a network it supports, then try again. If it's still stuck, refresh the page first."],
              ["The mint transaction failed", "This is usually the transaction being rejected in the wallet popup, or running low on test ETH for gas — get more from a Sepolia faucet and try again."],
              ["I want to update my score after new commits", "Just search your profile again and mint — it updates your existing badge rather than creating a second one. You'll only ever hold one."],
            ].map(([q, a], i, arr) => (
              <div key={q} className={`bg-surface px-5 py-4 ${i !== arr.length - 1 ? "border-b border-hairline/60" : ""}`}>
                <p className="font-body text-sm font-semibold text-ivory">{q}</p>
                <p className="mt-1 font-body text-sm leading-relaxed text-muted">{a}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="glossary" eyebrow="Reference" title="Glossary">
          <div className="overflow-hidden rounded-xl border border-hairline shadow-card">
            {GLOSSARY.map((g) => (
              <GlossaryItem key={g.term} {...g} />
            ))}
          </div>
        </Section>
      </div>

      <div className="mt-16 flex flex-wrap gap-4">
        <Link
          to="/score"
          className="rounded-lg bg-gold px-6 py-3 font-display font-semibold text-surface transition-opacity hover:opacity-90"
        >
          Score a profile
        </Link>
        <Link
          to="/faq"
          className="rounded-lg border border-hairline px-6 py-3 font-display font-semibold text-ivory transition-colors hover:border-signal/60"
        >
          Read the FAQ
        </Link>
      </div>
    </div>
  );
}