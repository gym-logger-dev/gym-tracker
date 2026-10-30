const tseslint = require('typescript-eslint');
const expoFlat = require('eslint-config-expo/flat');

module.exports = tseslint.config(
  { ignores: ['node_modules/', 'coverage/', '.claude/', 'docs/', 'data/', 'supabase/', '.expo/'] },
  ...expoFlat,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { module: 'writable', require: 'readonly' },
    },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    // Block @ts-ignore outright (STORY-002 AC2); @ts-expect-error needs a description.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' },
      ],
    },
  },
);
