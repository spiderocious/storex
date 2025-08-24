module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'warn',
    'no-unused-vars': 'off', // Turn off base rule as it can report incorrect errors
  },
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'tests/**/*.ts'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
};
