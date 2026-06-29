import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

// ESLint flat config。聚焦抓真实问题（未用变量、React hooks 规则与依赖），
// 对现有代码里少量 any / console 放宽以避免噪声。
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "test-results/**",
      "playwright-report/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // 现有代码在图标/事件类型处使用少量 any，先放宽避免噪声
      "@typescript-eslint/no-explicit-any": "off",
      // 教学前端允许 console（调试用）
      "no-console": "off",
    },
  },
);
