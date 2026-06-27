import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f3efe5",
        ink: "#1c252b",
        cream: "#e9dfc4",
        rust: "#a44d3d",
        blush: "#e7b8b0",
        sage: "#9aa58b"
      },
      fontFamily: {
        body: ["Avenir Next", "Avenir", "Trebuchet MS", "sans-serif"],
        hand: ["Segoe Print", "Bradley Hand", "Comic Sans MS", "cursive"]
      },
      boxShadow: {
        sketch: "4px 5px 0 rgba(28,37,43,.16)"
      }
    }
  },
  plugins: []
} satisfies Config;
