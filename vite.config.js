import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
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
            }
        }
    }
});
