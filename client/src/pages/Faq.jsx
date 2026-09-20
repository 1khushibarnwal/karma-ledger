import FAQSection from "../components/FAQSection";

export default function Faq() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
        Questions, answered plainly
      </h1>
      <p className="mt-3 max-w-[62ch] font-body text-base leading-relaxed text-muted">
        Including the parts of this design that are genuinely weak. A reputation system
        that oversells itself is worth less than one that tells you where to doubt it.
      </p>
      <div className="mt-12">
        <FAQSection />
      </div>
    </div>
  );
}