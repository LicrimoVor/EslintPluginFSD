import { RuleTester } from "eslint";
import * as parser from "@typescript-eslint/parser";

import {rules} from "../../src/rules/path-checker"

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


ruleTester.run("path-checker", rules, {
  valid: [
    {
      filename: 'C:\\Users\\Lic\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
    },
    {
      filename: 'D:\\Code\\TypeScripts\\frontend_learn\\src\\shared\\lib\\components\\ThemeProvider\\ThemeProvider.tsx',
      code: "import { useJsonSettings } from '@/entities/User';",
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
