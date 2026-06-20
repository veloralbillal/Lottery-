import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
  return {
    plugins: [tailwindcss()],
    server: {
      hmr: false,
      port: 3000,
      host: '0.0.0.0'
    },
  };
});

