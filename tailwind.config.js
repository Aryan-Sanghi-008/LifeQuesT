/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{tsx,ts}", "./src/**/*.{tsx,ts}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Core backgrounds
        bg: "#080C14",
        "bg-2": "#0E1420",
        "bg-3": "#141B28",
        "bg-4": "#1A2235",
        "bg-card": "rgba(255,255,255,0.04)",

        // Brand — Midnight Gold
        gold: "#E8A838",
        "gold-2": "#F5C46A",
        "gold-3": "#D4922A",

        // Accent — Electric Teal
        teal: "#00D4B4",
        "teal-2": "#00B09A",

        // Danger — Crimson
        crimson: "#E8385A",
        "crimson-2": "#C22244",

        // Info — Sapphire
        sapphire: "#4A9EFF",
        "sapphire-2": "#2B7FE0",

        // Orchid
        orchid: "#A855F7",
        "orchid-2": "#8730D9",

        // Neutral text
        "t-1": "#F0F4FF",
        "t-2": "rgba(240,244,255,0.60)",
        "t-3": "rgba(240,244,255,0.35)",
        "t-4": "rgba(240,244,255,0.18)",

        // Borders
        border: "rgba(255,255,255,0.07)",
        "border-2": "rgba(255,255,255,0.04)",
      },
      fontFamily: {
        "display-black": ["PlayfairDisplay-Black"],
        "display-bold": ["PlayfairDisplay-Bold"],
        body: ["DMSans-Regular"],
        "body-medium": ["DMSans-Medium"],
        "body-semibold": ["DMSans-SemiBold"],
        "body-bold": ["DMSans-Bold"],
        mono: ["JetBrainsMono-Regular"],
        "mono-semibold": ["JetBrainsMono-SemiBold"],
      },
      borderRadius: {
        sm: "10px",
        md: "14px",
        lg: "20px",
        xl: "28px",
        phone: "50px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
