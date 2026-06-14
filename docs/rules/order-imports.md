# lkx-fsd/order-imports

📝 Проверяет порядок импортов.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Описание

Правило группирует импорты в ожидаемом порядке: внешние библиотеки, `shared`, `entities`, `features`, `widgets`, `pages`, дополнительные публичные группы, относительные импорты и стили.

Если между import-блоками есть обычный код, автофикс сортирует только тот непрерывный блок импортов, где найдена ошибка. Код и комментарии между блоками не удаляются.

## Incorrect

```ts
import AuthCard from "features/AuthCard";
import Button from "shared/Button";
```

```ts
import React from "react";

const t = 5;
// тест

import AuthCard from "features/AuthCard";
import Button from "shared/Button";
```

## Correct

```ts
import Button from "shared/Button";
import AuthCard from "features/AuthCard";
```

```ts
import React from "react";

const t = 5;
// тест

import Button from "shared/Button";
import AuthCard from "features/AuthCard";
```

### Options

- `alias`: алиас для абсолютных импортов, например `"@"`.
- `otherImport`: дополнительные группы абсолютных импортов.
