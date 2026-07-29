import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // 3D 層：react-three-fiber 本來就靠 useFrame 直接改 ref 上的 Object3D 與材質，
    // 每幀走 React state 會炸效能。這三條規則與 R3F 慣例衝突，不是真的 bug。
    files: ['src/actions/**', 'src/body/**', 'src/scene/**'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
    },
  },
  {
    // 元件檔同時 export 常數只影響 Fast Refresh 的 DX，不影響正確性
    files: ['src/components/ui/**', 'src/components/GuestForm.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
