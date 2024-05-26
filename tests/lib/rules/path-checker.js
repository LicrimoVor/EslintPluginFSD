/**
 * @fileoverview  
 * @author licrimovor
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/path-checker"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parserOptions: {ecmaVersion: 6, sourceType: 'module'}
});
ruleTester.run("path-checker", rule, {
  valid: [
    {
      filename: 'C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
      errors: [],
    },
    {
      filename: 'D:\\Code\\TypeScripts\\frontend_learn\\src\\shared\\lib\\components\\ThemeProvider\\ThemeProvider.tsx',
      code: "import { useJsonSettings } from '@/entities/User';",
      errors: [],
    },
  ],

  invalid: [
    {
      filename: 'C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными"}],
      options: [
        {
          alias: '@'
        }
      ],
      output: "import { addCommentFormActions, addCommentFormReducer } from './model/slices/addCommentFormSlice'"
    },
    {
      filename: 'C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными" }],
      output: "import { addCommentFormActions, addCommentFormReducer } from './model/slices/addCommentFormSlice'"
    },
  ],
});
