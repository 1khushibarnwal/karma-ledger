/** @type {import('tailwindcss').Config} */

// Every colour is a CSS variable holding an "R G B" triple. That keeps the
// existing utility names (bg-surface, text-ivory, border-hairline/60) working
// untouched in both themes, and keeps Tailwind's /opacity modifiers working.
const themed = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: themed("ink"),
        surface: themed("surface"),
        surface2: themed("surface2"),
        hairline: themed("hairline"),
        ivory: themed("ivory"),
        muted: themed("muted"),
        bronze: themed("bronze"),
        silver: themed("silver"),
        gold: themed("gold"),
        platinum: themed("platinum"),
        signal: themed("signal"),
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(var(--c-shadow) / 0.28), 0 8px 24px -12px rgb(var(--c-shadow) / 0.35)",
        lift: "0 2px 4px rgb(var(--c-shadow) / 0.3), 0 16px 40px -16px rgb(var(--c-shadow) / 0.45)",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        strike: {
          "0%": { opacity: "0", transform: "scale(1.35)" },
          "60%": { opacity: "1", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        rise: "rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        strike: "strike 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};
