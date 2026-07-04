import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function serveAndCopyAssetsPlugin() {
  return {
    name: 'serve-and-copy-assets',
    // 1. Dev mode: Serve .php files and config JSONs
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const decodedUrl = decodeURIComponent(req.url.split('?')[0]);
        // Resolve path relative to project root
        const filePath = path.join(process.cwd(), decodedUrl);
        
        // Only serve if the file exists and is a file
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath);
          if (ext === '.php' || ext === '.json' || decodedUrl.endsWith('firebase-applet-config.json')) {
            let contentType = 'text/plain';
            if (ext === '.php') {
              contentType = 'text/html';
            } else if (ext === '.json') {
              contentType = 'application/json';
            }
            res.setHeader('Content-Type', contentType);
            res.end(fs.readFileSync(filePath));
            return;
          }
        }
        next();
      });
    },
    // 2. Build mode: Copy .php and root config JSON to dist folder
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      if (!fs.existsSync(distDir)) return;

      // Copy firebase-applet-config.json to dist
      const srcConfig = path.resolve(process.cwd(), 'firebase-applet-config.json');
      const destConfig = path.resolve(distDir, 'firebase-applet-config.json');
      if (fs.existsSync(srcConfig)) {
        fs.copyFileSync(srcConfig, destConfig);
        console.log('Copied firebase-applet-config.json to dist/');
      }

      // Copy other JSON config if exists
      const srcBlueprint = path.resolve(process.cwd(), 'firebase-blueprint.json');
      const destBlueprint = path.resolve(distDir, 'firebase-blueprint.json');
      if (fs.existsSync(srcBlueprint)) {
        fs.copyFileSync(srcBlueprint, destBlueprint);
      }

      // Recursively find and copy all .php files from src to dist/src
      const srcDir = path.resolve(process.cwd(), 'src');
      const destSrcDir = path.resolve(distDir, 'src');

      function copyRecursive(src, dest) {
        if (!fs.existsSync(src)) return;
        const stats = fs.statSync(src);
        if (stats.isDirectory()) {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          const files = fs.readdirSync(src);
          for (const file of files) {
            copyRecursive(path.join(src, file), path.join(dest, file));
          }
        } else if (stats.isFile()) {
          const ext = path.extname(src);
          if (ext === '.php' || ext === '.js' || ext === '.css') {
            const destDir = path.dirname(dest);
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            fs.copyFileSync(src, dest);
          }
        }
      }

      copyRecursive(srcDir, destSrcDir);
      console.log('Copied .php and other tab assets from src/ to dist/src/');
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      tailwindcss(),
      serveAndCopyAssetsPlugin()
    ],
    server: {
      hmr: false,
      port: 3000,
      host: '0.0.0.0'
    },
  };
});

