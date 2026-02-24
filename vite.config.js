import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    server: {
        open: true,
        port: 5173
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                notFound: resolve(__dirname, '404.html'),
                about: resolve(__dirname, 'about.html'),
                contact: resolve(__dirname, 'contact.html'),
                fmiph: resolve(__dirname, 'fmiph.html'),
                programs: resolve(__dirname, 'programs.html'),
                tyumen: resolve(__dirname, 'tyumen.html'),
                universities: resolve(__dirname, 'universities.html')
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].[hash].js',
                assetFileNames: '[name].[hash][extname]'
            }
        }
    },
    publicDir: 'public'
});
