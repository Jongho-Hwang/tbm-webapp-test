// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"SF Pro Display"', 'Pretendard', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: '#002F3D',
        secondary: '#FF9500',
        bg: '#F5F5F7',
        text: '#000000',
        subtext: '#3C3C4399',
      },
      borderRadius: {
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        soft: '0 4px 16px rgba(0,0,0,0.08)',
      },
    },
  },
};
