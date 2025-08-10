// tailwind.config.cjs
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  safelist: [{ pattern: /(bg|text|border|shadow|outline)-\[[^\]]+\]/ }],
  plugins: [],
};
