"use strict";

const path = require('path');
const isPathRelative = require('../shared/isPathRelative');

const layers = {
  'shared': 1,
  'entities': 2,
  'features': 3,
  'widgets': 4,
  'pages': 5,
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: "Feature sliced relative path checker",
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
          }
        },
        layersPlusOne: {
          type: 'array',
          items: {
            type: 'string',
          }
        },
      }
    ],
    messages: {
      errorPathMessage: 'В рамках одного слайса все пути должны быть относительными',
    },
  },

  create(context) {
    const alias = context.options[0]?.alias || '';

    const fromFilename = context.getFilename();
    const pathFrom = getNormalizedCurrentFilePath(fromFilename);
    if (pathFrom === undefined) {
      return {};
    }
    const pathArray = pathFrom.split('/');
    const fromLayer = pathArray[1];
    if(!layers[fromLayer]) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importWithAlias = node.source.value;
        let importTo = importWithAlias;

        if (alias) {
          const importToMassive = importWithAlias.split(`${alias}/`);
          importTo = importToMassive.length > 1? importToMassive[1]: importToMassive[0];
        }

        if(shouldBeRelative(pathArray, importTo)) {
          context.report({
            node: node,
            messageId: 'errorPathMessage',
            fix: fixer => {
              const normalizedPath = pathFrom
                .split('/')
                .join('/'); // путь файла без названия файла (директория файла)
              let relativePath = path.relative(normalizedPath, `/${importTo}`)
                .split('\\')
                .join('/');
              
              if (!relativePath.startsWith('.')) {
                relativePath = './' + relativePath;
              }
              return fixer.replaceText(node.source, `'${relativePath}'`)
            }
          });
        }
      }
    };
  },
};



function getNormalizedCurrentFilePath(currentFilePath) {
  const normalizedPath = path.toNamespacedPath(currentFilePath);
  const projectFrom = normalizedPath.split('src')[1];

  if (projectFrom === undefined) {
    return undefined;
  }

  return projectFrom.split('\\',).join('/');
}

function shouldBeRelative(fromArray, to) {
  if(isPathRelative(to)) {
    return false;
  }

  // example entities/Article
  const toArray = to.split('/')
  const toLayer = toArray[0]; // entities
  const toSlice = toArray[1]; // Article
  
  if(!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if (fromSlice === toSlice && toLayer === fromLayer) {
    return true;
  }

  return false;
}
