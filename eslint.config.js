import eslint from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import sonarjs from "eslint-plugin-sonarjs";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([".astro/*", "dist/*", ".vercel/*"]),
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  sonarjs.configs.recommended,

  {
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        alert: "readonly",
        console: "readonly",
        Request: "readonly",
        Response: "readonly",
        Headers: "readonly",
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "sonarjs/todo-tag": "off",
      "sonarjs/prefer-read-only-props": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/pseudo-random": "off",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: ["default"],
              message:
                "Default React import is not necessary for JSX to work. Use named imports (e.g. `import { useEffect } from 'react'`) (https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html).",
            },
          ],
          patterns: [
            {
              group: ["..*"],
              message:
                "Avoid using relative imports except sibling files. Use absolute imports instead.",
            },
          ],
        },
      ],
    },
    settings: {
      react: { version: "19.0" },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["./tsconfig.json"],
        },
      },
    },
  },
  eslintPluginAstro.configs.recommended,
  eslintPluginAstro.configs["flat/jsx-a11y-strict"],
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ["**/*.astro", "**/*.astro/*.ts"],
    ...tseslint.configs.disableTypeChecked,
  },
);
