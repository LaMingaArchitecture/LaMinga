import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['dist/', '.astro/', '.netlify/', 'netlify/', 'node_modules/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  astro.configs['jsx-a11y-recommended'],
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    // JavaScript for Automation (macOS) : run et openDocuments sont appelés par le système.
    files: ['docs/guide-utilisateur/kit-claude/outils/*.js'],
    languageOptions: {
      globals: { ObjC: 'readonly', $: 'readonly', Ref: 'readonly', Application: 'readonly' },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^(run|openDocuments)$' },
      ],
    },
  },
]);
