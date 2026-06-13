import { RuleTester } from "eslint";
import * as parser from "@typescript-eslint/parser";

import { rules } from "../../src/rules/public-import";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	languageOptions: {
		parser,
		parserOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
		},
	},
});

ruleTester.run("public-import", rules, {
	valid: [
		{
			code: "import {Article} from '../model/types/article';",
		},
		{
			code: "import {Article} from '@/entities/Article';",
			options: [
				{
					alias: "@",
				},
			],
		},
		{
			code: "import {Article} from 'entities/Article';",
		},
		{
			code: "import React from 'react';",
		},
		{
			code: "import type { Article } from '@/entities/Article/model/types/article';",
			options: [
				{
					alias: "@",
				},
			],
		},
		{
			code: "import { type Article } from '@/entities/Article/model/types/article';",
			options: [
				{
					alias: "@",
				},
			],
		},
		{
			filename:
				"D:\\Code\\TypeScripts\\eslint_plugin\\src\\features\\Article\\ui\\Article.testing.ts",
			code: "import Article from 'entities/Article/testing';",
			options: [
				{
					otherPublicImport: "testing",
					otherPublicPatterns: ["**/*.testing.ts"],
				},
			],
		},
		{
			code: "import ArticleRating from 'features/Article/Rating';",
			options: [
				{
					featuresEnclosure: ["Article"],
				},
			],
		},
		{
			code: "import { AppLink } from '@/shared/ui/AppLink';",
			options: [
				{
					layersPlusOne: ["shared"],
					alias: "@",
				},
			],
		},
		{
			filename:
				"D:\\Code\\TypeScripts\\eslint_plugin\\src\\widgets\\Article\\ui\\Article.stories.ts",
			code: "import ArticleRating from '@/features/Article/Rating/testing';",
			options: [
				{
					alias: "@",
					featuresEnclosure: ["Article"],
					otherPublicImport: "testing",
					otherPublicPatterns: ["**/*.stories.ts"],
				},
			],
		},
		{
			filename:
				"D:\\Code\\TypeScripts\\eslint_plugin\\src\\widgets\\Article\\ui\\Article.stories.ts",
			code: `
      import { themeDecorator } from '@/shared/config/storybook/themeDecorator';
      import { Theme } from '@/shared/lib/components/ThemeProvider';`,
			options: [
				{
					alias: "@",
					otherIgnoreLayer: ["shared"],
					otherPublicImport: "testing",
					otherPublicPatterns: ["**/*.stories.ts"],
				},
			],
		},
	],

	invalid: [
		{
			code: "import {Article} from 'shared/Article/articles';",
			errors: [{ message: "Импорт должен быть из public API" }],
			output: "import {Article} from 'shared/Article';",
		},
		{
			code: "import {Article} from '@/shared/Article/articles';",
			errors: [{ message: "Импорт должен быть из public API" }],
			options: [
				{
					alias: "@",
				},
			],
			output: "import {Article} from '@/shared/Article';",
		},
		{
			filename:
				"D:\\Code\\TypeScripts\\eslint_plugin\\src\\widgets\\Article\\ui\\Article.stories.ts",
			code: "import ArticleRating from '@/features/Article/Rating/model';",
			errors: [{ message: "Импорт должен быть из public API" }],
			options: [
				{
					alias: "@",
					featuresEnclosure: ["Article"],
					otherPublicImport: "testing",
					otherPublicPatterns: ["**/*.stories.ts"],
				},
			],
			output: "import ArticleRating from '@/features/Article/Rating';",
		},
		{
			code: `
        import { classNames } from '@/shared/lib/classNames/classNames';
        import { AppLink } from '@/shared/ui/AppLink/AppLink';
      `,
			errors: [
				{ message: "Импорт должен быть из public API" },
				{ message: "Импорт должен быть из public API" },
			],
			options: [
				{
					layersPlusOne: ["shared"],
					alias: "@",
				},
			],
			output: `
        import { classNames } from '@/shared/lib/classNames';
        import { AppLink } from '@/shared/ui/AppLink';
      `,
		},
		{
			code: `import { themeDecorator } from '@/shared/config/storybook/themeDecorator/themeDecorator';`,
			output: `import { themeDecorator } from '@/shared/config/storybook/themeDecorator';`,
			errors: [{ message: "Импорт должен быть из public API" }],
			options: [
				{
					layersPlusOne: ["shared"],
					alias: "@",
					sharedEnclosure: ["config"],
				},
			],
		},
	],
});
