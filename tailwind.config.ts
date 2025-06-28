import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#343541',
        container: '#3c3f4a',
        text: '#f1f1f1',
        accent: '#68D08B',
        'menu-item': '#a7a9b4',
        'promo-bg': '#373946',
        'promo-border': '#404055',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // Enhanced mobile-first responsive font sizes
        'xs': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.05em' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.05em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.075em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.075em' }],
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.1em' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.1em' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.1em' }],
        
        // Custom responsive typography
        'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        'display-md': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.05em' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.075em' }],
        'display-xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.075em' }],
        
        'body-xs': ['0.75rem', { lineHeight: '1.5' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-xl': ['1.25rem', { lineHeight: '1.6' }],
        
        'caption': ['0.75rem', { lineHeight: '1.4' }],
        'overline': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      lineHeight: {
        tight: '1.2',
        snug: '1.3',
        normal: '1.4',
        relaxed: '1.6',
        loose: '1.8',
      },
      letterSpacing: {
        tighter: '-0.1em',
        tight: '-0.075em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      boxShadow: {
        header: '2px 0 3px 0 #00000085',
        promo: '0 0 4px 0 #1a1b27ad',
        'text-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'text-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'text-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        large: '12px',
        button: '6px',
      },
      spacing: {
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem',
        '18': '4.5rem',
        '88': '22rem',
        '92': '23rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
};

export default config; 