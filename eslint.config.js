import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts'
  ]),
  {
    rules: {
      eqeqeq: 'off',
      indent: ['error', 2],
      // 关闭 JS 原生的 no-unused-vars 规则 (无法理解Ts, 会误报 Type 定义)
      'no-unused-vars': 'off',
      // 开启 TS 专用规则 @typescript-eslint/no-unused-vars
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '^_', // 忽略以 _ 开头的参数
          'varsIgnorePattern': '^_', // 忽略以 _ 开头的变量
          'caughtErrorsIgnorePattern': '^_' // 忽略以 _ 开头的 catch 错误
        }
      ],
      // 使用分号
      // @unessential
      semi: ['warn', 'never'],
      // 分号必须写在行尾
      // @unessential
      'semi-style': ['warn', 'last'],
      // 用逗号分隔的多行结构，不允许尾随逗号
      'comma-dangle': ['warn', 'never'],
      // 优先使用 const，只有当变量会被重新赋值时才使用 let
      // @unessential
      'prefer-const': [
        'warn',
        {
          destructuring: 'any',
          ignoreReadBeforeAssign: true
        }
      ],
      // 使用 const 或 let 声明变量，不要使用 var
      // @unessential
      'no-var': 'warn',
      // 一行声明一个变量
      //  'one-var-declaration-per-line': ['warn', 'always'],
      // 一条声明语句声明一个变量
      'one-var': ['warn', 'never'],
      // 该规则不允许在循环体中使用 await。
      'no-await-in-loop': 'error',

      // 禁止条件表达式中的赋值运算符
      'no-cond-assign': 'error',

      // 不允许重新分配 const 变量
      'no-const-assign': 'error',

      // 禁止使用 debugger
      'no-debugger': 'error',

      // 不允许 function 定义中的重复参数
      'no-dupe-args': 'error',

      // 禁止 if-else-if 链中的重复条件
      'no-dupe-else-if': 'error',

      // 禁止对象字面量中的重复键
      'no-dupe-keys': 'error',

      // 不允许重复的案例标签
      'no-duplicate-case': 'error',

      // 禁止重复的模块导入。 此规则要求来自单个模块的所有可以合并的导入都存在于单个 import 语句中。
      'no-duplicate-imports': 'error',
      // 使用模板字符串替代字符串拼接
      'prefer-template': 'warn',

      // 方括号内部两侧无空格-数组
      'array-bracket-spacing': ['error', 'never'],

      // 箭头函数参数需要括号
      'arrow-parens': ['warn', 'always'],

      // 箭头函数的箭头前后各留一个空格
      // @unessential
      'arrow-spacing': ['error', { before: true, after: true }],

      // 大括号换行风格：one true brace style 风格，且单行代码块可不换行
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],

      // 逗号的前面无空格，后面有空格
      'comma-spacing': ['error', { before: false, after: true }],

      // 用逗号分隔的多行结构，将逗号放到行尾
      'comma-style': ['error', 'last'],

      // 方括号内部两侧无空格-计算属性
      'computed-property-spacing': ['error', 'never'],

      // 统一在点号之前换行
      // @unessential
      'dot-location': ['error', 'property'],

      // 在文件末尾保留一行空行
      'eol-last': ['warn', 'always'],

      // 函数名与调用它的括号间无空格
      'func-call-spacing': ['error', 'never'],

      // 在函数的小括号内使用一致的换行风格
      'function-paren-newline': ['error', 'consistent'],

      // JSX 属性使用双引号，不要使用单引号
      // @unessential
      'jsx-quotes': ['error', 'prefer-double'],

      // 关键字前后各一个空格
      'keyword-spacing': [
        'error',
        {
          before: true,
          after: true,
          overrides: {
            return: { after: true },
            throw: { after: true },
            case: { after: true }
          }
        }
      ],

      // 单行最大字符数：100
      'max-len': [
        'warn',
        200,
        2,
        {
          ignoreUrls: true,
          ignoreComments: false,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true
        }
      ],

      // 在长方法链式调用时进行换行
      'newline-per-chained-call': ['warn', { ignoreChainWithDepth: 4 }],

      // 不要混用空格和 tab
      'no-mixed-spaces-and-tabs': 'error',

      // 禁止出现多个连续空格
      // @unessential
      'no-multi-spaces': [
        'warn',
        {
          ignoreEOLComments: false
        }
      ],

      // 禁止出现多个（大于 2 个）连续空行
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],

      // 行尾不要留有空格
      'no-trailing-spaces': [
        'error',
        {
          skipBlankLines: false,
          ignoreComments: false
        }
      ],

      // 禁止属性调用前有空格
      'no-whitespace-before-property': 'error',

      // 省略大括号的单行语句前不要换行
      'nonblock-statement-body-position': ['error', 'beside', { overrides: {} }],

      // 大括号内部两侧有空格
      'object-curly-spacing': ['error', 'always'],

      // 对象的属性需遵循一致的换行风格：即所有属性要么都换行，要么都写在一行
      'object-property-newline': [
        'error',
        {
          allowAllPropertiesOnSameLine: true
        }
      ],

      // 块的开始和结束不能是空行
      'padded-blocks': ['warn', { blocks: 'never', classes: 'never', switches: 'never' }],

      // 字符串优先使用单引号
      quotes: ['error', 'single', { avoidEscape: true }],

      // 分号的前面无空格，后面有空格
      'semi-spacing': ['error', { before: false, after: true }],

      // 块的左大括号前有一个空格
      'space-before-blocks': 'error',

      // 函数声明时，对于命名函数，参数的小括号前无空格；对于匿名函数和 async 箭头函数，参数的小括号前有空格
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always'
        }
      ],

      // 小括号内部两侧无空格
      'space-in-parens': ['error', 'never'],

      // 中缀操作符两侧有空格
      'space-infix-ops': 'error',

      // 一元操作符两侧无空格，包括 -、+、--、++、!、!!
      'space-unary-ops': [
        'error',
        {
          words: true,
          nonwords: false,
          overrides: {}
        }
      ],

      // switch 的 case 和 default 子句冒号前面无空格，后面有空格
      'switch-colon-spacing': ['error', { after: true, before: false }],

      // 模板字符串中的大括号内部两侧无空格
      // @unessential
      'template-curly-spacing': 'warn',

      // 模板字符串的 tag 后面无空格
      'template-tag-spacing': ['error', 'never']
    }
  }
])

export default eslintConfig
