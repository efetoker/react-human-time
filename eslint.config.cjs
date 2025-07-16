const { defineConfig } = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const globals = require("globals");
const js = require("@eslint/js");
const { FlatCompat } = require("@eslint/eslintrc");

const promisePlugin = require("eslint-plugin-promise");
const securityPlugin = require("eslint-plugin-security");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    files: ["**/*.js", "**/*.cjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: "latest",
      sourceType: "commonjs",
    },
    extends: compat.extends(
      "eslint:recommended",
      "plugin:prettier/recommended"
    ),
    plugins: {
      promise: promisePlugin,
      security: securityPlugin,
    },
    rules: {
      ...promisePlugin.configs.recommended.rules,
      ...securityPlugin.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,

      globals: {
        ...globals.node,
      },

      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {},
    },

    extends: compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended"
    ),

    plugins: {
      "@typescript-eslint": typescriptEslint,
      promise: promisePlugin,
      security: securityPlugin,
    },

    rules: {
      ...promisePlugin.configs.recommended.rules,
      ...securityPlugin.configs.recommended.rules,
    },
  },
]);
