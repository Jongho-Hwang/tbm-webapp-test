// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* 환경변수(VITE_DEPLOY_TARGET)가 github 일 때만
   GitHub Pages 하위 경로(base)를 사용 */
const base =
  process.env.VITE_DEPLOY_TARGET === 'github'
    ? '/tbm-webapp/'   // ← 홈페이지 경로와 반드시 동일
    : '/';

export default defineConfig({
  base,
  plugins: [react()],
});
