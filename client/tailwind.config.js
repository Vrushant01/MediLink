/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F5F2EB',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#14231D',
          soft: '#5B6B63',
        },
        'ink-soft': '#5B6B63',
        line: '#E2DDD0',
        brand: {
          DEFAULT: '#0E4A38',
          soft: '#DCEBE3',
        },
        'brand-soft': '#DCEBE3',
        accent: {
          DEFAULT: '#E4572E',
          hover: '#CC4922',
        },
        // Expiry status tokens
        status: {
          expired: '#B3261E',
          'expired-bg': '#FBE4E1',
          critical: '#C2410C',
          'critical-bg': '#FDE8D8',
          warning: '#A16207',
          'warning-bg': '#FAF0CC',
          safe: '#166534',
          'safe-bg': '#DDF0E2',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        none: '0px',
        sm: '4px',
        md: '6px',
        lg: '10px',
        panel: '10px',
        input: '6px',
        btn: '6px',
      },
      boxShadow: {
        none: 'none',
        panel: '0 1px 2px rgba(20, 35, 29, 0.04)',
        subtle: '0 1px 2px rgba(20, 35, 29, 0.04)',
        modal: '0 8px 30px rgba(20, 35, 29, 0.12)',
        popover: '0 4px 20px -2px rgba(20, 35, 29, 0.08)',
      },
      spacing: {
        'page': '32px',
        'row': '44px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
        '150': '150ms',
        '200': '200ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out forwards',
      },
    },
  },
  plugins: [],
};
