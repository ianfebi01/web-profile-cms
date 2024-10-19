import globals from 'globals'

import path from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import pluginJs from '@eslint/js'

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: pluginJs.configs.recommended })

export default [
  {
    rules: {
      'space-in-parens': ['error', 'always'],
      semi: ['error', 'never'],
      'no-underscore-dangle': ['warn'],
      'comma-dangle': ['error', 'always-multiline'],
      'key-spacing': [
        'error',
        {
          align: {
            beforeColon: true,
            afterColon: true,
            on: 'colon'
          }
        }
      ],
      'no-multi-spaces': ['error', { exceptions: { VariableDeclarator: true } }],
      'func-names': ['error', 'as-needed'],
      quotes: ['error', 'double'],
      camelcase: [
        'error',
        {
          ignoreImports: true,
          ignoreDestructuring: true,
          properties: 'never',
          allow: ['__']
        }
      ]
    },
    languageOptions: {
      globals: globals.browser
    }
  },
  ...compat.extends('standard')
]
