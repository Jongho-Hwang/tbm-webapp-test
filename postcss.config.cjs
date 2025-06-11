// postcss.config.js
module.exports = {
  plugins: [
    // Tailwind v4+용 PostCSS 플러그인
    require('@tailwindcss/postcss'),
    // 자동 접두사
    require('autoprefixer'),
  ]
}
