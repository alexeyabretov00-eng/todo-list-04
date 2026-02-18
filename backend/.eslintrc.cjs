/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Disallow wildcard imports and re-exports (constitution §V)
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ImportNamespaceSpecifier',
        message: 'Wildcard imports (import *) are not allowed per constitution §V.',
      },
      {
        selector: 'ExportAllDeclaration',
        message: 'Wildcard re-exports (export * from) are not allowed per constitution §V.',
      },
    ],

    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-require-imports': 'off',
  },
};
