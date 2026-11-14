const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'supabase/functions/*', 'src/types/database.types.ts'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/services/supabase',
              message:
                'Las pantallas y componentes no llaman a Supabase directamente: usa los hooks de src/features.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/features/**',
      'src/services/**',
      'src/hooks/**',
      'src/stores/**',
      '**/*.test.ts',
      '**/*.test.tsx',
    ],
    rules: { 'no-restricted-imports': 'off' },
  },
]);
