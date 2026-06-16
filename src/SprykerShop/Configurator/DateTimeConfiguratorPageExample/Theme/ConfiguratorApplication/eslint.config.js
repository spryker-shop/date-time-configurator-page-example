// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');

module.exports = tseslint.config(
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                projectService: {
                    // environment.prod.ts is wired via angular.json fileReplacements only,
                    // so no tsconfig includes it in its program.
                    allowDefaultProject: ['src/environments/environment.prod.ts'],
                },
                tsconfigRootDir: __dirname,
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            '@angular-eslint': angular,
        },
        // Lint inline component templates as HTML.
        processor: angularTemplate.processors['extract-inline-html'],
        rules: {
            ...eslint.configs.recommended.rules,
            ...tseslint.configs.recommended.reduce((rules, config) => ({ ...rules, ...config.rules }), {}),
            '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
            '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
            '@angular-eslint/no-output-on-prefix': 'error',
            '@angular-eslint/no-empty-lifecycle-method': 'error',
            '@angular-eslint/use-lifecycle-interface': 'error',
            '@angular-eslint/contextual-lifecycle': 'error',
            // Project code style favours explicit, minimal typing; allow inferred return types.
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
    {
        files: ['src/**/*.html'],
        languageOptions: {
            parser: angularTemplateParser,
        },
        plugins: {
            '@angular-eslint/template': angularTemplate,
        },
        rules: {
            '@angular-eslint/template/banana-in-box': 'error',
            '@angular-eslint/template/no-negated-async': 'error',
            '@angular-eslint/template/no-interpolation-in-attributes': 'error',
            '@angular-eslint/template/use-track-by-function': 'error',
            '@angular-eslint/template/no-duplicate-attributes': 'error',
            '@angular-eslint/template/eqeqeq': 'error',
        },
    },
);
