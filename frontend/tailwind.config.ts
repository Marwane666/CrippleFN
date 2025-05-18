
import { type Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: {
          DEFAULT: "#334155", 
          light: "#475569",
        },
        background: {
          dark: "#0f172a", // Dark navy background
          medium: "#1e293b", // Medium navy for cards, containers
          light: "#334155", // Light navy for interactive elements
        },
        primary: {
          main: "#6366f1", // Indigo for main actions, trust indicators
          light: "#818cf8",
          dark: "#4f46e5",
        },
        secondary: {
          main: "#22c55e", // Green for positive actions, verified content
          light: "#4ade80",
          dark: "#16a34a",
        },
        alert: {
          error: "#ef4444", // Red for errors, fake news
          warning: "#f59e0b", // Amber for warnings, unverified content
          info: "#0ea5e9", // Blue for information
        },
        text: {
          primary: "#f8fafc", // Light text for dark backgrounds
          secondary: "#cbd5e1", // Gray text for secondary information
          muted: "#64748b", // Muted text for less important elements
        },
        navy: "#0f172a",
        "navy-light": "#1e293b",
        orange: "#ed8936",
        "orange-light": "#f6ad55",
        
        // Required shadcn/ui variables
        input: "#334155",
        ring: "#6366f1",
        background: "#0f172a",
        foreground: "#f8fafc",
        muted: {
          DEFAULT: "#334155",
          foreground: "#cbd5e1",
        },
        accent: {
          DEFAULT: "#1e293b",
          foreground: "#f8fafc",
        },
        card: {
          DEFAULT: "#1e293b",
          foreground: "#f8fafc",
        },
        popover: {
          DEFAULT: "#1e293b",
          foreground: "#f8fafc",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#f8fafc",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        "slide-up": {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
