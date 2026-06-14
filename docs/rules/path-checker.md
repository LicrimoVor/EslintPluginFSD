# lkx-fsd/path-checker

📝 Проверяет относительные пути внутри одного FSD-слайса.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Описание

Если файл импортирует модуль из того же слоя и того же слайса, путь должен быть относительным. Это помогает не смешивать публичный API с внутренними импортами одного слайса.

## Incorrect

```ts
// файл: src/entities/Article/ui/ArticleCard.tsx
import { articleReducer } from "@/entities/Article/model/slice/articleSlice";
```

```ts
// файл: src/entities/Article/ui/ArticleCard.tsx
import { articleReducer } from "entities/Article/model/slice/articleSlice";
```

## Correct

```ts
// файл: src/entities/Article/ui/ArticleCard.tsx
import { articleReducer } from "../model/slice/articleSlice";
```

### Options

- `alias`: алиас для абсолютных импортов, например `"@"`.
