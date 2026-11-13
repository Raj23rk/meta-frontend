/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          sidebar: '#0F172A',
          screen: '#F8FAFC',
          officePrimary: '#059669',
        },
        whatsapp: {
          light: '#25D366',
          DEFAULT: '#128C7E',
          dark: '#075E54',
          teal: '#128C7E',
          chatbg: '#EFEAE2',
          bubble: '#D9FDD3',
        }
      }
    },
  },
  plugins: [],
}

