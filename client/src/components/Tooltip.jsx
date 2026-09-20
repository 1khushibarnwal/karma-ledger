export default function Tooltip({ text, children }) {
  return (
    <span className="group relative inline-flex cursor-help items-center">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-56 -translate-y-1 rounded-lg border border-hairline bg-surface2 px-3 py-2 font-body text-xs leading-relaxed text-ivory opacity-0 shadow-lg transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}