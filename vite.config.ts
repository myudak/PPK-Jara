import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [laravel({ input: ['resources/js/main.tsx'], refresh: true }), react(), tailwindcss()],
    resolve: { alias: { '@': '/resources/js' } },
    server: { watch: { ignored: ['**/storage/framework/views/**'] } },
    test: {
        environment: 'jsdom',
        setupFiles: ['./resources/js/test/setup.ts'],
    },
});
