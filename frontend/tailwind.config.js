/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B192C',
          navy: '#1E3E62',
          primary: '#005B41',
          accent: '#FF6500',
          emerald: '#10B981',
          gold: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};
