import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Quantum color palette
        quantum: {
          cyan: "hsl(var(--quantum-cyan))",
          "cyan-glow": "hsl(var(--quantum-cyan-glow))",
          purple: "hsl(var(--quantum-purple))",
          "purple-glow": "hsl(var(--quantum-purple-glow))",
          blue: "hsl(var(--quantum-blue))",
          green: "hsl(var(--quantum-green))",
          orange: "hsl(var(--quantum-orange))",
        },
        matrix: {
          DEFAULT: "hsl(var(--matrix-green))",
          dim: "hsl(var(--matrix-dim))",
        },
        space: {
          void: "hsl(var(--space-void))",
          deep: "hsl(var(--space-deep))",
          medium: "hsl(var(--space-medium))",
          light: "hsl(var(--space-light))",
        },
        step: {
          1: "hsl(var(--step-1))",
          2: "hsl(var(--step-2))",
          3: "hsl(var(--step-3))",
          4: "hsl(var(--step-4))",
          5: "hsl(var(--step-5))",
        },
      },
      backgroundImage: {
        "gradient-quantum": "var(--gradient-quantum)",
        "gradient-cyber": "var(--gradient-cyber)",
        "gradient-earth": "var(--gradient-earth)",
        "gradient-space": "var(--gradient-space)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        quantum: "var(--shadow-quantum)",
        "glow-cyan": "var(--glow-cyan)",
        "glow-purple": "var(--glow-purple)",
        "glow-green": "var(--glow-green)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px hsl(185 100% 50% / 0.3)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 40px hsl(185 100% 50% / 0.5)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
