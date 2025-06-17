import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
        fontFamily: {
          sans: ["Inter var", ...defaultTheme.fontFamily.sans],
        },
        borderRadius: {
          DEFAULT: "8px",
          secondary: "4px",
          container: "12px",
        },
        boxShadow: {
          DEFAULT: "0 1px 4px rgba(0, 0, 0, 0.1)",
          hover: "0 2px 8px rgba(0, 0, 0, 0.12)",
          active: "0 4px 12px rgba(0, 0, 0, 0.16)",
        },
        colors: {
          primary: {
            DEFAULT: "#4F46E5",
            hover: "#4338CA",
          },
          secondary: {
            DEFAULT: "#6B7280",
            hover: "#4B5563",
          },
          accent: {
            DEFAULT: "#8B5CF6",
            hover: "#7C3AED",
          },
        },
        spacing: {
          "form-field": "16px",
          section: "32px",
        },
       
      },
    },
  
  plugins: [require('@tailwindcss/forms')],
};
export default config;

