// vite.config.js
import { defineConfig }     from 'vite';
import react                from '@vitejs/plugin-react-swc';

/* -------------------------------------------------
 *  VITE_DEPLOY_TARGET 환경변수로 배포 대상 구분
 *    - local/dev            : undefined  (npm run dev)
 *    - GitHub Pages build   : github     (npm run build:gh)
 *    - Firebase build       : firebase   (npm run build)
 * ------------------------------------------------- */
export default defineConfig(({ mode }) => {
  // .env, cross-env, npm script 등으로 주입
  const target = process.env.VITE_DEPLOY_TARGET || mode;   // fallback

  const isGitHub = target === 'github';   // true → /tbm-webapp/ 로 빌드
  return {
    plugins: [
      react({
        tsDecorators: false,
        babel: { parserOpts: { plugins: ['jsx'] } },
      }),
    ],

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },

    /* ◼︎ 가장 중요: 정적 자산의 루트 경로 */
    base: isGitHub ? '/tbm-webapp/' : '/',

    server: { port: 5173 },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
