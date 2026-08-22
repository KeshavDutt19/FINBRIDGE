export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        ink: '#12201a',
        mint: '#0f766e',
        copper: '#b45309',
        cloud: '#f6f8f7'
      },
      boxShadow: {
        soft: '0 18px 60px rgba(18, 32, 26, 0.10)'
      }
    }
  },
  plugins: []
};
