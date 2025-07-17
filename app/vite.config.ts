import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import path from 'path'; // ← 追加！

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
