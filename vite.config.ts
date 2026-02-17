import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // 🔥 هذا هو السطر السحري! بدونه ستظهر شاشة بيضاء في البرنامج النهائي
    base: './',

    server: {
      port: 3000, // ممتاز، تأكد أن main.js يطلب هذا المنفذ
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        // نصيحة: عادة نربط @ بمجلد src لسهولة الاستدعاء
        '@': path.resolve(__dirname, './src'), 
      }
    },
    build: {
      outDir: 'dist', // للتأكد أن مجلد الإخراج اسمه dist
      emptyOutDir: true,
    }
  };
});