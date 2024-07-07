import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: {
      quoteProps: 'as-needed',
      commaDangle: 'never',
      braceStyle: '1tbs'
    }
  }
}).overrideRules({
  '@typescript-eslint/no-dynamic-delete': 'off',
  '@typescript-eslint/no-explicit-any': 'off'
})
