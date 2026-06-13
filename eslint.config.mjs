import js from "@eslint/js";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import n from "eslint-plugin-n";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["node_modules/**", "docs/**", ".eslintrc.js"],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["**/*.ts"],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			"eslint-plugin": eslintPlugin,
			n,
		},
		rules: {
			...eslintPlugin.configs.recommended.rules,
			...n.configs["flat/recommended"].rules,
			"n/no-missing-import": "off",
			"n/no-unsupported-features/es-syntax": "off",
		},
	},
	{
		files: ["tests/**/*.ts"],
		rules: {
			"n/no-unpublished-import": "off",
		},
	},
);
