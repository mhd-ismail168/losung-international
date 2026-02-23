import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                notFound: resolve(__dirname, '404.html'),
                about: resolve(__dirname, 'pages/about.html'),
                contact: resolve(__dirname, 'pages/contact.html'),
                fmiph: resolve(__dirname, 'pages/fmiph.html'),
                programs: resolve(__dirname, 'pages/programs.html'),
                tyumen: resolve(__dirname, 'pages/tyumen.html'),
                universities: resolve(__dirname, 'pages/universities.html')
            }
        }
    }
});
