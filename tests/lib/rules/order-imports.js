/**
 * @fileoverview  
 * @author LicrimoVor
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/order-imports"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {ecmaVersion: 6, sourceType: 'module'}
});
ruleTester.run("order-imports", rule, {
  valid: [
    {
      code: `
      import React from 'react';

      import Button from '@/shared/Button';
      import Article from '@/entities/Article';
      import {reducer} from '../model/slice/componentSlice';
      import cls from './Component.module.scss';
      `,
      errors: [],
      options: [
        {
          alias: '@',
          otherImport: []
        }
      ],
    },
    {
      code: `
      import React from 'react';

      import Button from 'shared/Button';
      import Article from 'entities/Article';
      import {reducer} from '../model/slice/componentSlice';
      import cls from './Component.module.scss';
      `,
      errors: [],
    },
  ],

  invalid: [
    {
      code: 
`import React from 'react';

import AuthCard, {Lol, Kek} from 'features/AuthCard';
import Button, {ButtonLol, ButtonKek} from 'shared/Button';
import Link, {LinkLol, LinkKek} from 'shared/Link';
import Text, {TextLol, TextKek} from 'shared/Text';
`,
      errors: [
        { message: 'Импорт SHARED должен быть раньше, чем импорт FEATURES', line: 4 },
        { message: 'Импорт SHARED должен быть раньше, чем импорт FEATURES', line: 5 },
        { message: 'Импорт SHARED должен быть раньше, чем импорт FEATURES', line: 6 },
      ],
      output: 
`import React from 'react';

import Button, { ButtonLol, ButtonKek } from 'shared/Button';
import Link, { LinkLol, LinkKek } from 'shared/Link';
import Text, { TextLol, TextKek } from 'shared/Text';
import AuthCard, { Lol, Kek } from 'features/AuthCard';
`,
    },
    {
      code: 
`import { FC, memo } from 'react';

import cls from './SidebarItem.module.scss';
import { getUserAuthData } from '@/entities/User';
import { classNames } from '@/shared/lib/classNames/classNames';
import { AppLink } from '@/shared/ui/AppLink/AppLink';
import { useTranslation } from 'react-i18next';
import { SidebarItemType } from '../../model/types/sidebar';
import { useSelector } from 'react-redux';
import { page } from '@/pages/Page';
`,
      errors: [
        { message: 'Импорт ENTITIES должен быть раньше, чем импорт STYLE', line: 4 },
        { message: 'Импорт SHARED должен быть раньше, чем импорт STYLE', line: 5 },
        { message: 'Импорт SHARED должен быть раньше, чем импорт STYLE', line: 6 },
        { message: 'Импорт LIBRARY должен быть раньше, чем импорт STYLE', line: 7 },
        { message: 'Импорт RELATIVE должен быть раньше, чем импорт STYLE', line: 8 },
        { message: 'Импорт LIBRARY должен быть раньше, чем импорт STYLE', line: 9 },
        { message: 'Импорт PAGE должен быть раньше, чем импорт STYLE', line: 10 },
      ],
      options: [
        {
          alias: '@'
        }
      ],
      output: 
`import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { classNames } from '@/shared/lib/classNames/classNames';
import { AppLink } from '@/shared/ui/AppLink/AppLink';
import { getUserAuthData } from '@/entities/User';
import { page } from '@/pages/Page';

import { SidebarItemType } from '../../model/types/sidebar';
import cls from './SidebarItem.module.scss';
`,
    },
    {
      code: 
        `import React from 'react';

        const a = 1;

        import AuthCard, {Lol, Kek} from 'features/AuthCard';
        import Button, {ButtonLol, ButtonKek} from 'shared/Button';
        `,
      errors: [
        { message: 'Импорт SHARED должен быть раньше, чем импорт FEATURES', line: 6 },
      ],
      output: null
    },
    {
      code: 
`import React from 'react';

import AuthCard, {Lol, Kek as KekDep} from 'features/AuthCard';
import Button, {ButtonLol as ButtonDeprecated, ButtonKek} from 'shared/Button';
`,
      errors: [
        { message: 'Импорт SHARED должен быть раньше, чем импорт FEATURES', line: 4 },
      ],
      output: 
`import React from 'react';

import Button, { ButtonLol as ButtonDeprecated, ButtonKek } from 'shared/Button';
import AuthCard, { Lol, Kek as KekDep } from 'features/AuthCard';
`,
    },
    {
      code: 
`import Button, {ButtonLol as ButtonDeprecated, ButtonKek} from 'shared/Button';
import 'app/index.css';
`,
      errors: [
        { message: 'Импорт LIBRARY должен быть раньше, чем импорт SHARED', line: 2 },
      ],
      output: 
`import 'app/index.css';

import Button, { ButtonLol as ButtonDeprecated, ButtonKek } from 'shared/Button';
`,
    },
  ],
});
