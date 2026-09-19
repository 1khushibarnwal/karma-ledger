/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D1117",       // GitHub-dark base — this app lives on top of GitHub data
        surface: "#161B22",
        surface2: "#1C2128",
        hairline: "#30363D",
        ivory: "#E6EDF3",
        muted: "#8B949E",
        bronze: "#B08D57",
        silver: "#C7CDD4",
        gold: "#D4A657",
        platinum: "#8FE3D3",
        signal: "#56D4C1",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
