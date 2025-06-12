// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/tbm-webapp-test/', // 슬래시( / ) 필수, 저장소명으로 정확히!
});
