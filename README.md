# eslint-plugin-lkx-fsd

new rule 
```sh
yo eslint:rule 
```

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-lkx-fsd`:

```sh
npm install eslint-plugin-lkx-fsd --save-dev
```

## Usage

Add `lkx-fsd` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "lkx-fsd"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "lkx-fsd/rule-name": 2
    }
}
```



## Configurations

<!-- begin auto-generated configs list -->
TODO: Run eslint-doc-generator to generate the configs list (or delete this section if no configs are offered).
<!-- end auto-generated configs list -->



## Rules

<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                         | Description                                           | 🔧 |
| :------------------------------------------- | :---------------------------------------------------- | :- |
| [layer-checker](docs/rules/layer-checker.md) | Проверяет импорт по уровню доступа FSD                |    |
| [order-imports](docs/rules/order-imports.md) | Проверяет порядок импортов                            | 🔧 |
| [path-checker](docs/rules/path-checker.md)   | Проверяет относительные пути внутри одного FSD-слайса | 🔧 |
| [public-import](docs/rules/public-import.md) | Проверяет импорт через public API слайса              | 🔧 |

<!-- end auto-generated rules list -->


