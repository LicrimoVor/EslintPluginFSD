import { RuleTester } from "eslint";
import * as parser from "@typescript-eslint/parser";

import { rules } from "../../src/rules/layer-checker";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	languageOptions: {
		parser,
		parserOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			ecmaFeatures: { jsx: true },
		},
	},
});

ruleTester.run("layer-checker", rules, {
	valid: [
		{
			filename:
				"C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\entities\\Article.ts",
			code: "import React, { type FC } from 'React'",
		},
		{
			filename:
				"C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\config\\Article.ts",
			code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
		},
		{
			filename:
				"C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\app\\Article.ts",
			code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
		},
		{
			filename:
				"C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\entities\\Article.ts",
			code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/slices/addCommentFormSlice'",
			options: [
				{
					alias: "@",
				},
			],
		},
		{
			code: `
        import { type FC, memo } from 'react';
        import { useTranslation } from 'react-i18next';
        import { useSelector } from 'react-redux';

        import { getUserAuthData } from '@/entities/User';
        import { classNames } from '@/shared/lib/classNames/classNames';
        import { AppLink } from '@/shared/ui/AppLink/AppLink';
        import { SidebarItemType } from '../../model/types/sidebar';
        import cls from './SidebarItem.module.scss';`,
			filename:
				"C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\entities\\Article.ts",
			options: [
				{
					alias: "@",
				},
			],
		},
	],

	invalid: [
		{
			filename:
				"C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\features\\Article.ts",
			code: "import { addCommentFormActions, addCommentFormReducer } from 'widgets/Article/model/slices/addCommentFormSlice'",
			errors: [
				{
					message:
						"Импорт из верхних частей FSD структуры невозможен",
				},
			],
		},
		{
			filename:
				"C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\features\\Article.ts",
			code: "import { addCommentFormActions, addCommentFormReducer } from '@/widgets/Article/model/slices/addCommentFormSlice'",
			errors: [
				{
					message:
						"Импорт из верхних частей FSD структуры невозможен",
				},
			],
			options: [
				{
					alias: "@",
				},
			],
		},
	],
});
