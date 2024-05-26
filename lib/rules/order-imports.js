const isPathRelative = require('../shared/isPathRelative');
"use strict";

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null,
    docs: {
      description: "Checks the import sequence",
      recommended: false,
      url: null,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string'
          },
          otherImport: {
            type: 'array',
            items: {
              type: 'string',
            }
          }
        }
      },
    ],
  },

  create(context) {
    const alias = context.options[0]?.alias || '';
    const otherImport = context.options[0]?.otherImport || [];
    const defineClassPriorityImport = defineClassPriority(otherImport);
    let classPriorityMax;
    let priorityMax = 0;
    let nodeMax;
    
    const importDict = {
      'library': [],
      'publicShared': [],
      'publicEntities': [],
      'publicFeatures': [],
      'publicWidgets': [],
      'publicPages': [],
      'publicOther': [],
      'relative': [],
      'css': [],
    };

    return {
      "Program:exit": (node) => {
        if (nodeMax) {
          const { range, orderCode } = orderedImports(importDict);
          const canFix = isCanFix(node);

          context.report({
            node: nodeMax.node,
            message: nodeMax.message,
            fix: canFix && ((fixer) => (
              fixer.replaceTextRange(range, orderCode)
            ))
          });
        }
      },
      ImportDeclaration(node) {
        const importWithAlias = node.source.value;
        let importTo = importWithAlias;
        if (alias) {
          const importToMassive = importWithAlias.split(`${alias}/`);
          importTo = importToMassive.length > 1? importToMassive[1]: importToMassive[0];
        }
        const classPriority = defineClassPriorityImport(importTo);
        const priorityNow = import_priority[classPriority];
        importDict[classPriority].push({
          specifiers: node.specifiers,
          source: node.source,
          range: node.range,
        });

        if (priorityNow > priorityMax) {
          classPriorityMax = classPriority;
          priorityMax = priorityNow;
        }

        if (priorityNow < priorityMax) {
          const messFirst = message_classPriority[classPriority];
          const messNext = message_classPriority[classPriorityMax];
          if (!nodeMax) {
            nodeMax = {
              node,
              message: `Импорт ${messFirst} должен быть раньше, чем импорт ${messNext}`,
            }
          }
          else {
            
            context.report({
              node,
              message: `Импорт ${messFirst} должен быть раньше, чем импорт ${messNext}`,
            })
          }
        }
      }
    };
  },
};

const layers = {
  shared: 'publicShared',
  entities: 'publicEntities',
  features: 'publicFeatures',
  widgets: 'publicWidgets',
  pages: 'publicPages',
}

const import_priority = {
  'library': 1.0,
  'publicShared': 2.0,
  'publicEntities': 2.1,
  'publicFeatures': 2.2,
  'publicWidgets': 2.3,
  'publicPages': 2.4,
  'publicOther': 2.5,
  'relative': 3.0,
  'css': 4.0,
}

const message_classPriority = {
  'library': 'LIBRARY',
  'publicShared': 'SHARED',
  'publicEntities': 'ENTITIES',
  'publicFeatures': 'FEATURES',
  'publicWidgets': 'WIDGETS',
  'publicPages': 'PAGE',
  'publicOther': 'OTHER',
  'relative': 'RELATIVE',
  'css': 'STYLE',
}

const style_expansion = [
  'scss',
  'css',
]

const defineClassPriority = (otherImport) => (importTo) => {
  if (isPathRelative(importTo)) {
    const importExpansion = importTo.split('.').pop();

    if (style_expansion.includes(importExpansion)) {
      return 'css';
    }

    return 'relative';
  }

  const importLayer = importTo.split('/')[0];

  if (otherImport.includes(importLayer)) {
    return 'publicOther';
  }

  if (layers[importLayer] === undefined) {
    return 'library';
  }

  return layers[importLayer];
}

const orderedImports = (importDict) => {
  const importClasses = Object.keys(import_priority);
  let orderCode = [];
  const range = [0, 0];

  for (let i = 0; i < importClasses.length; i+=1) {
    const importList = importDict[importClasses[i]];
    
    importList.map((importC) => {
      orderCode.push(createImport(importC.specifiers, importC.source));

      if (importC.range[1] > range[1]) {
        range[1] = importC.range[1];
      }
    })

    if (importClasses[i] === 'library' || importClasses[i] === 'publicOther') {
      orderCode.push("");
    }
  }

  if (orderCode[orderCode.length-1] === "") {
    orderCode.pop();
  } 
  return {orderCode: orderCode.join('\n'), range};
}

const isCanFix = (nodes) => {
  let endImports = false;
  return !nodes.body.some(node => {
    if (node.type !== 'ImportDeclaration') {
      endImports = true;
    }

    if (endImports && node.type === 'ImportDeclaration') {
      return true;
    }
    return false;
  });
}

const createImport = (specifiers, source) => {

  if (specifiers.length === 0) {
    return `import '${source.value}';`;
  }

  const imports = specifiers.map(specifier => {
    if (specifier.type === 'ImportDefaultSpecifier') {
      // условное обзначение дефолтного импорта
      return `*default*${specifier.local.name}`;
    }

    if (specifier.local.name == specifier.imported.name) {
      return specifier.local.name;
    }
    
    return `${specifier.imported.name} as ${specifier.local.name}`;
  });

  const notDefaultImports = imports.filter(str => !(str.slice(0,9) === '*default*'));
  const notDefaultImportsStr = `{ ${notDefaultImports.join(', ')} }`;

  if (imports.some(str => Boolean(str.slice(0,9) === '*default*'))) {
    const defaultImport = imports.filter(str => Boolean(str.slice(0, 9) === '*default*'))[0].slice(9);

    if (notDefaultImports.length === 0) {
      return `import ${defaultImport} from '${source.value}';`; 
    }

    return `import ${defaultImport}, ${notDefaultImportsStr} from '${source.value}';`;
  }

  return `import ${notDefaultImportsStr} from '${source.value}';`;
}
