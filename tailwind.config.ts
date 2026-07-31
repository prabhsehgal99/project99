import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050508",
        panel: "#101014",
        muted: "#a1a1aa",
        emerald: {
          glow: "#34d399"
        },
        purple: {
          glow: "#a78bfa"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(52, 211, 153, 0.16)"
      }
    }
  },
  plugins: [forms]
};

export default config;
