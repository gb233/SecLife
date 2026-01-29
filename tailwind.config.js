/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Noto Sans SC", "sans-serif"],
        body: ["Noto Sans SC", "sans-serif"],
      },
      colors: {
        ink: "#0b0d12",
        slate: "#e6e8ef",
        haze: "#a1a7b8",
        dawn: "#151822",
        ember: "#f59e0b",
        cta: "#f97316",
      },
      boxShadow: {
        soft: "0 8px 18px -12px rgba(15, 23, 42, 0.6)",
        card: "0 6px 12px -8px rgba(15, 23, 42, 0.55)",
      },
      backgroundImage: {
        "grid-fade": "radial-gradient(circle at top, rgba(148, 163, 184, 0.08), transparent 70%)",
        "mesh": "radial-gradient(circle at 20% 20%, rgba(15, 23, 42, 0.6), transparent 55%), radial-gradient(circle at 80% 10%, rgba(30, 41, 59, 0.45), transparent 55%), radial-gradient(circle at 50% 80%, rgba(2, 6, 23, 0.65), transparent 60%)",
      },
    },
  },
  plugins: [],
}
