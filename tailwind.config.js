/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{tsx,ts}", "./src/**/*.{tsx,ts}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg:       "#F4F6F9",
        "bg-2":   "#ECEEF2",
        "bg-3":   "#FFFFFF",
        "bg-4":   "#F8F9FB",
        "bg-card": "#FFFFFF",
        "bg-sheet": "#FFFFFF",

        gold:    "#F59E0B",
        "gold-2": "#FCD34D",
        "gold-3": "#D97706",

        teal:    "#0EA5E9",
        "teal-2": "#0284C7",

        crimson:    "#EF4444",
        "crimson-2": "#DC2626",

        sapphire:    "#3B82F6",
        "sapphire-2": "#2563EB",

        orchid:    "#8B5CF6",
        "orchid-2": "#7C3AED",

        emerald:    "#10B981",
        "emerald-2": "#059669",

        health:       "#EF4444",
        happiness:    "#F59E0B",
        intelligence: "#3B82F6",
        wealth:       "#059669",
        fitness:      "#10B981",
        looks:        "#EC4899",
        social:       "#8B5CF6",
        ambition:     "#F97316",

        "death-bg":  "#020408",
        "death-bg-2": "#05080F",

        "t-1": "#0F172A",
        "t-2": "#374151",
        "t-3": "#6B7280",
        "t-4": "#9CA3AF",

        border:    "#E5E7EB",
        "border-2": "#F3F4F6",
      },
      fontFamily: {
        "display-black": ["PlayfairDisplay-Black"],
        "display-bold":  ["PlayfairDisplay-Bold"],
        body:            ["DMSans-Regular"],
        "body-medium":   ["DMSans-Medium"],
        "body-semibold": ["DMSans-SemiBold"],
        "body-bold":     ["DMSans-Bold"],
        mono:            ["JetBrainsMono-Regular"],
        "mono-semibold": ["JetBrainsMono-SemiBold"],
      },
      borderRadius: {
        sm: "10px",
        md: "14px",
        lg: "18px",
        xl: "24px",
        phone: "50px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
