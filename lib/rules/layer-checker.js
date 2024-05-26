const isPathRelative = require('../shared/isPathRelative');
"use strict";

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null,
    docs: {
      description: " ",
      recommended: false,
      url: null,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string'
          }
        }
      }
    ],
  },

  create(context) {
    const alias = context.options[0]?.alias || '';
    const filename = context.getFilename();
    const layer = filename? defineLayer(filename) : undefined;

    return {
      ImportDeclaration(node) {
        const importWithAlias = node.source.value;
        let importTo = importWithAlias;

        if (alias) {
          const importToMassive = importWithAlias.split(`${alias}/`);
          importTo = importToMassive.length > 1? importToMassive[1]: importToMassive[0];
        }

        if(layer && validateLayerImport(layer, importTo)) {
          context.report({
            node: node,
            message: 'Импорт из верхних частей FSD стурктуры невозможен'
          });
        }
      }
    };
  },
};


const layerCorrectImports = {
  'shared': ['shared'],
  'entities': ['shared', 'entities'],
  'features': ['shared', 'entities',],
  'widgets': ['shared', 'entities', 'features'],
  'pages': ['shared', 'entities', 'features', 'widgets'],
  'app': ['shared', 'entities', 'features', 'widgets', 'pages'],
}

function validateLayerImport(layer, importTo) {
  if (isPathRelative(importTo)) {
    return false;
  }

  const importLayer = importTo.split('/')[0];
  const correctImports = layerCorrectImports[layer];

  if (!Object.keys(layerCorrectImports).includes(importLayer)) {
    return false;
  }

  return !correctImports.includes(importLayer);
}


function defineLayer(filename) {
  const dirs = filename.split('\\');

  let layer;
  for (let i=dirs.length-1; i > 0; i -=1 ) {
    if (Object.keys(layerCorrectImports).includes(dirs[i])) {
      layer = dirs[i];
    }
  }

  return layer
}