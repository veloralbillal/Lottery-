import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [],
    server: {
      hmr: false,
      port: 3000,
      host: '0.0.0.0'
    },
  };
});
