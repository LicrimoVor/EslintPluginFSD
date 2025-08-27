/**
 * @fileoverview  
 * @author LicrimoVor
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/layer-checker"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {ecmaVersion: 6, sourceType: 'module'}
});
ruleTester.run("layer-checker", rule, {
  valid: [
    {
      filename: 'C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import React from 'React'",
      errors: [],
    },
    {
      filename: 'C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\config\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
      errors: [],
    },
    {
      filename: 'C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\app\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
      errors: [],
    },
    {
      filename: 'C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/slices/addCommentFormSlice'",
      errors: [],
      options: [
        {
          alias: '@'
        }
      ]
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
        errors: [],
        filename: 'C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\entities\\Article',
        options: [
          {
            alias: '@'
          }
        ]
    }
  ],

  invalid: [
    {
      filename: 'C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\features\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'widgets/Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "Импорт из верхних частей FSD стурктуры невозможен"}],
    },
    {
      filename: 'C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\features\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/widgets/Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "Импорт из верхних частей FSD стурктуры невозможен"}],
      options: [
        {
          alias: '@'
        }
      ]
    },
  ],
});
