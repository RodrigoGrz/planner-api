import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    include: ['./src/infra/http/controllers/*.spec.ts'],
    exclude: ['./src/infra/http/controllers/upload-trip-cover-image.spec.ts'],
    globals: true,
    root: './',
    pool: 'threads',
    environment: './tests/setup-e2e.ts',
    isolate: true,
    reporters: ['default', 'hanging-process'],
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
