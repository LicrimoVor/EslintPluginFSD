/**
 * @fileoverview  
 * @author LicrimoVor
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/public-import"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {ecmaVersion: 6, sourceType: 'module'}
});
ruleTester.run("public-import", rule, {
  valid: [
    {
      code: "import {Article} from '../model/types/article';",
      errors: [],
    },
    {
      code: "import {Article} from '@/entities/Article';",
      errors: [],
      options: [
        {
          alias: '@'
        }
      ]
    },
    {
      code: "import {Article} from 'entities/Article';",
      errors: [],
    },
    {
      code: "import React from 'react';",
      errors: [],
    },
    {
      filename: 'D:\\Code\\TypeScripts\\eslint_plugin\\src\\features\\Article\\ui\\Article.testing.ts',
      code: "import Article from 'entities/Article/testing';",
      errors: [],
      options: [
        {
          otherPublicImport: 'testing',
          otherPublicPatterns: ['**/*.testing.ts',]
        }
      ]
    },
    {
      code: "import ArticleRating from 'features/Article/Rating';",
      errors: [],
      options: [
        {
          featuresEnclosure: ['Article']
        }
      ]
    },
    {
      code: "import { AppLink } from '@/shared/ui/AppLink';",
      errors: [],
      options: [
        {
          layersPlusOne: ['shared'],
          alias: '@',
        }
      ]
    },
    {
      filename: 'D:\\Code\\TypeScripts\\eslint_plugin\\src\\widgets\\Article\\ui\\Article.stories.ts',
      code: "import ArticleRating from '@/features/Article/Rating/testing';",
      errors: [],
      options: [
        {
          alias: '@',
          featuresEnclosure: ['Article'],
          otherPublicImport: 'testing',
          otherPublicPatterns: ['**/*.stories.ts',]
        }
      ]
    },
    {
      filename: 'D:\\Code\\TypeScripts\\eslint_plugin\\src\\widgets\\Article\\ui\\Article.stories.ts',
      code: `
      import { themeDecorator } from '@/shared/config/storybook/themeDecorator';
      import { Theme } from '@/shared/lib/components/ThemeProvider';`,
      errors: [],
      options: [
        {
          alias: '@',
          otherIgnoreLayer: ['shared'],
          otherPublicImport: 'testing',
          otherPublicPatterns: ['**/*.stories.ts',]
        }
      ]
    }
  ],

  invalid: [
    {
      code: "import {Article} from 'shared/Article/articles';",
      errors: [{ message: "Импорт должен быть из public API"}],
      output: "import {Article} from 'shared/Article';"
    },
    {
      code: "import {Article} from '@/shared/Article/articles';",
      errors: [{ message: "Импорт должен быть из public API"}],
      options: [
        {
          alias: '@'
        }
      ],
      output: "import {Article} from '@/shared/Article';"
    },
    {
      filename: 'D:\\Code\\TypeScripts\\eslint_plugin\\src\\widgets\\Article\\ui\\Article.stories.ts',
      code: "import ArticleRating from '@/features/Article/Rating/model';",
      errors: [{ message: "Импорт должен быть из public API"}],
      options: [
        {
          alias: '@',
          featuresEnclosure: ['Article'],
          otherPublicImport: 'testing',
          otherPublicPatterns: ['**/*.stories.ts',]
        }
      ],
      output: "import ArticleRating from '@/features/Article/Rating';",
    },
    {
      code: `
        import { classNames } from '@/shared/lib/classNames/classNames';
        import { AppLink } from '@/shared/ui/AppLink/AppLink';
      `,
      errors: [{ message: "Импорт должен быть из public API"}, { message: "Импорт должен быть из public API"}],
      options: [
        {
          layersPlusOne: ['shared'],
          alias: '@',
        }
      ],
      output: `
        import { classNames } from '@/shared/lib/classNames';
        import { AppLink } from '@/shared/ui/AppLink';
      `
    },
    {
      code: `import { themeDecorator } from '@/shared/config/storybook/themeDecorator/themeDecorator';`,
      output: `import { themeDecorator } from '@/shared/config/storybook/themeDecorator';`,
      errors: [{ message: "Импорт должен быть из public API"}],
      options: [
        {
          layersPlusOne: ['shared'],
          alias: '@',
          sharedEnclosure: ['config'],
        }
      ],
    }
  ],
});
