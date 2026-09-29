import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import perfectionist from "eslint-plugin-perfectionist";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/** Regras válidas em todo o repositório. */
export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  perfectionist.configs["recommended-natural"],
  prettier,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": "off",
      // Promise solta é a origem de metade dos bugs do Stage 4 do roadmap.
      "no-restricted-syntax": [
        "error",
        {
          message: "Use `void` explícito ou `await`. Promise solta engole erro.",
          selector: "ExpressionStatement > CallExpression[callee.property.name='then']",
        },
      ],
      // sort-modules reordena DECLARACOES de funcao alfabeticamente, o que
      // destroi a ordem narrativa de um arquivo (helpers depois de quem usa).
      // As demais regras do perfectionist ficam: ordenar imports, exports e
      // chaves de objeto e ganho real de leitura.
      "perfectionist/sort-modules": "off",
    },
  },
];

/** @param {string[]} files */
export const nodeConfig = (files) => [{ files, languageOptions: { globals: globals.node } }];

/** @param {string[]} files */
export const reactConfig = (files) => [
  {
    files,
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
];
