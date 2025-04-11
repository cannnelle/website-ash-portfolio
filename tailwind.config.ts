import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // Explicitly add globals.css to content scanning? (Less common, but worth a try)
    // './src/app/globals.css', 
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        'tightest': '-.075em',
        'tighter': '-.05em',
        'tight': '-.025em',
        'normal': '0',
        'wide': '.025em',
        'wider': '.05em',
        'widest': '.1em',
        'px': '1px',
      }
    },
  },
  plugins: [],
}
export default config 