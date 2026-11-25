import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'site/**/*.{test,spec}.{ts,tsx}'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
