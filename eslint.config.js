import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      eqeqeq: 'off',
      'prefer-const': ['error', { 'ignoreReadBeforeAssign': true }],
      indent: ['error', 2],
      quotes: ['error', 'single'],
      'object-curly-spacing': ['error', 'always'],
      // 关闭 JS 原生的 no-unused-vars 规则 (无法理解Ts, 会误报 Type 定义)
      'no-unused-vars': 'off',
      // 开启 TS 专用规则 @typescript-eslint/no-unused-vars
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '^_', // 忽略以 _ 开头的参数
          'varsIgnorePattern': '^_', // 忽略以 _ 开头的变量
          'caughtErrorsIgnorePattern': '^_', // 忽略以 _ 开头的 catch 错误
        },
      ],
    },
  },
]);

export default eslintConfig;
