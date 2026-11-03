import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['resources/js/**/*.test.js'],
        coverage: {
            provider: 'v8',
            include: ['resources/js/**/*.{js,jsx}'],
            exclude: ['resources/js/**/*.test.js'],
            reporter: ['text-summary', 'lcov'],
            reportsDirectory: 'coverage/js',
        },
    },
});
