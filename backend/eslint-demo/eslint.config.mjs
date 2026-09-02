import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      // 级别 2 = error 1 = warn 警告 0 = off 关闭
      "no-var": 2,// 不能用var声明变量
      "no-console": 1,// 不能用console 开发时用，上线后不用
      "quotes": ["error", "double"],// 只能用双引号
      "semi": ["error", "always"],// ;
      "indent": ["error", 2]
    }
  },
  tseslint.configs.recommended,
]);
