/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",       // ✅ todas las páginas del App Router
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",     // ✅ compatibilidad con Page Router
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",// ✅ todos los componentes
    "./src/**/*.{js,ts,jsx,tsx,mdx}",           // ✅ fallback general
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
