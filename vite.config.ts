import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8000';

  return {
    plugins: [react()],
    assetsInclude: ['**/*.glb'],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (_err, _req, res) => {
              const httpRes = res as any;
              if (httpRes && !httpRes.headersSent && typeof httpRes.writeHead === 'function') {
                httpRes.writeHead(503, { 'Content-Type': 'application/json' });
                httpRes.end(JSON.stringify({ success: false, message: 'Backend is currently offline' }));
              }
            });
          }
        }
      }
    },
    preview: {
      host: true
    }
  };
});
