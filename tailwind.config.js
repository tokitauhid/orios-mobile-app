/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // zinc-950
        surface: "#18181b",    // zinc-900
        surfaceElevated: "#27272a", // zinc-800
        borderSubtle: "#27272a",
        borderMuted: "#3f3f46",
      },
    },
  },
  plugins: [],
};
