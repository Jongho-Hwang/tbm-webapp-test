// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';   // ← SWC 버전 사용

export default defineConfig({
  plugins: [
    react({
      tsDecorators: false,      // 필요 시 true
      // 아래 babel 옵션은 JS 파일(.js) 안에 JSX 를 쓸 때만 필요
      babel: {
        parserOpts: {
          plugins: ['jsx'],
        },
      },
    }),
  ],

  // JSX 확장자를 확실히 인식하도록 설정
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },

  /*  🔖 Firebase Hosting(또는 GitHub Pages)에서
      /index.html 로 SPA 리라이트를 쓰는 구조면
      base는 루트(/)가 맞습니다.  */
  base: '/',

  /* dev 서버 포트 등 추가 옵션이 필요하면 여기에 */
  server: {
    port: 5173,
  },
});
