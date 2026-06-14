# lkx-fsd/public-import

📝 Проверяет импорт через public API слайса.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Описание

Правило запрещает импортировать внутренние файлы чужого FSD-слайса напрямую. Вместо этого нужно импортировать из public API слайса.

Type-only импорты не считаются нарушением:

```ts
import type { Article } from "@/entities/Article/model/types/article";
import { type ArticleSchema } from "@/entities/Article/model/types/article";
```

## Incorrect

```ts
import { Article } from "@/entities/Article/ui/Article/Article";
```

```ts
import { classNames } from "@/shared/lib/classNames/classNames";
```

## Correct

```ts
import { Article } from "@/entities/Article";
```

```ts
import { classNames } from "@/shared/lib/classNames";
```

### Options

- `alias`: алиас для абсолютных импортов, например `"@"`.
- `otherIgnoreLayer`: слои, которые нужно игнорировать при проверке дополнительного public API.
- `layersPlusOne`: слои, у которых public API находится на один сегмент глубже.
- `otherPublicImport`: имя дополнительного public API, например `"testing"`.
- `otherPublicPatterns`: glob-паттерны файлов, где разрешен дополнительный public API.
- `sharedEnclosure`: слайсы `shared` с вложенным public API.
- `widgetEnclosure`: слайсы `widgets` с вложенным public API.
- `featuresEnclosure`: слайсы `features` с вложенным public API.
- `pageEnclosure`: слайсы `pages` с вложенным public API.
