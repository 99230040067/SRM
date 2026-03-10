/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        "background-soft": "#020617",
        "accent-cyan": "#00D4FF",
        "accent-amber": "#FFB347"
      }
    }
  },
  plugins: []
};
