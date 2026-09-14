import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'coverage/**',
    'public/sw.js',
    'tests/**',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // These legacy patterns are visible in CI as warnings while they are migrated
      // incrementally; they do not block a verified production build.
      '@next/next/no-assign-module-variable': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);
