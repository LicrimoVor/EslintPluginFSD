# lkx-fsd/layer-checker

📝 Проверяет импорт по уровню доступа FSD.

<!-- end auto-generated rule header -->

## Описание

Правило запрещает импортировать вышележащие слои FSD из нижележащих. Например, `features` не должен импортировать `widgets`, а `entities` не должен импортировать `features`.

## Incorrect

```ts
// файл: src/features/article/ui/Article.tsx
import WidgetArticle from "widgets/Article";
```

```ts
// файл: src/entities/article/model/article.ts
import CreateArticle from "@/features/CreateArticle";
```

## Correct

```ts
// файл: src/features/article/ui/Article.tsx
import { Article } from "entities/Article";
```

```ts
// файл: src/widgets/article/ui/ArticleWidget.tsx
import CreateArticle from "@/features/CreateArticle";
```

### Options

- `alias`: алиас для абсолютных импортов, например `"@"`.
