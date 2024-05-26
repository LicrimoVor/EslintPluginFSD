/**
 * @fileoverview  
 * @author LicrimoVor
 */
"use strict";

const isPathRelative = require('../shared/isPathRelative');
const micromatch = require('micromatch');

const layers = [
  'shared',
  'entities',
  'features',
  'widgets',
  'pages',
]

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null,
    docs: {
      description: "Checking the import from the index.ts public",
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
          otherIgnoreLayer: {
            type: 'array',
            items: {
              type: 'string',
            }
          },
          layersPlusOne: {
            type: 'array',
            items: {
              type: 'string',
            }
          },
          otherPublicImport: {
            type: 'string',
          },
          otherPublicPatterns: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          sharedEnclosure: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          widgetEnclosure: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          featuresEnclosure: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          pageEnclosure: {
            type: 'array',
            items: {
              type: 'string'
            } 
          },
        }
      }
    ],
    messages: {
      errorPathMessage: 'Импорт должен быть из public API',
      errorOtherImport: 'Нельзя импоритровать из testing-API'
    },
  },

  create(context) {
    const {
      alias = '',
      otherPublicPatterns = [],
      otherPublicImport = 'testing',
      layersPlusOne = [],
      otherIgnoreLayer,
      ...enclosures
    } = context.options[0] || {};

    const isOther = otherPublicPatterns.some(pattern => micromatch.isMatch(context.getFilename(), pattern));

    return {
      ImportDeclaration(node) {
        const importWithAlias = node.source.value;
        let importTo = importWithAlias;

        if (alias) {
          const importToMassive = importWithAlias.split(`${alias}/`);
          importTo = importToMassive.length > 1? importToMassive[1]: importToMassive[0];
        }

        if (isOther) {
          const isIgnore = otherIgnoreLayer? !otherIgnoreLayer.some(layer => importTo.includes(layer)): true;
          if (isIgnore &&
              checkOtherImportPublic(importTo, otherPublicImport, layersPlusOne, enclosures)
          ) {
            context.report({
              node: node,
              messageId: 'errorPathMessage',
              fix: fixer => (
                fixer.replaceText(node.source, fixImport(importTo, alias, layersPlusOne, enclosures))
              )
            });
          }
        }
        else {
          if (checkImportPublic(importTo, layersPlusOne, enclosures)) {
            context.report({
              node: node,
              messageId: 'errorPathMessage',
              fix: fixer => (
                fixer.replaceText(node.source, fixImport(importTo, alias, layersPlusOne, enclosures))
              )
            });
          }

          if (otherPublicImport.includes(importTo.split('/').pop())) {
            context.report({
              node: node,
              messageId: 'errorOtherImport',
              fix: fixer => (
                fixer.replaceText(node.source, fixImport(importTo, alias, layersPlusOne, enclosures))
              )
            });
          }
        }
      }
    };
  },
};


function checkImportPublic(to, layersPlusOne, enclosures) {
  if (isPathRelative(to)) {
    return false;
  }
  
  const importDirs = Array.from(to.split('/'));

  if (importDirs.length < 2) {
    return false;
  }

  const importLayer = importDirs[0];
  const importSlice = importDirs[1];

  let maxLenght = 2;

  if (!layers.includes(importLayer)) {
    return false;
  }

  if (layersPlusOne.includes(importLayer)) {
    maxLenght += 1;
  }
  if (isEnclosure(importLayer, importSlice, enclosures)) {
    maxLenght += 1;
  }

  return importDirs.length > maxLenght;
}


function checkOtherImportPublic(to, otherPublicImport, layersPlusOne, enclosures) {

  if (isPathRelative(to)) {
    return false;
  }
  
  const importDirs = Array.from(to.split('/'));

  if (importDirs.length < 2) {
    return false;
  }

  const importLayer = importDirs[0];
  const importSlice = importDirs[1];
  const importPublic = importDirs[importDirs.length-1];

  let maxLenght = 2;

  if (!layers.includes(importLayer)) {
    return false;
  }

  if (layersPlusOne.includes(importLayer)) {
    maxLenght += 1;
  }
  if (isEnclosure(importLayer, importSlice, enclosures)) {
    maxLenght += 1;
  }

  if (importPublic === otherPublicImport) {
    maxLenght += 1;
  }

  return importDirs.length > maxLenght;
}


function isEnclosure(importLayer, importSlice, enclosures) {
  const {
    sharedEnclosure = [],
    featuresEnclosure = [],
    pageEnclosure = [],
    widgetEnclosure = [],
  } = enclosures;

  if (importLayer === 'shared' && sharedEnclosure.includes(importSlice)) {
    return true
  }
  if (importLayer === 'features' && featuresEnclosure.includes(importSlice)) {
    return true
  }
  if (importLayer === 'widgets' && widgetEnclosure.includes(importSlice)) {
    return true
  }
  if (importLayer === 'pages' && pageEnclosure.includes(importSlice)) {
    return true
  }
  return false
}


function fixImport(importTo, alias, layersPlusOne, enclosures) {
  const importDirs = Array.from(importTo.split('/'));
  const start = alias? `'${alias}/` : '\'';

  const importLayer = importDirs[0];
  const importSlice = importDirs[1];

  if(isEnclosure(importLayer, importSlice, enclosures)) {
    if (layersPlusOne.includes(importLayer)) {
      const importPlusOne = importDirs[2];
      const importEnclosure = importDirs[3];

      return `${start}${importLayer}/${importSlice}/${importPlusOne}/${importEnclosure}'`;
    }
    const importEnclosure = importDirs[2];
    return `${start}${importLayer}/${importSlice}/${importEnclosure}'`;
  }

  if (layersPlusOne.includes(importLayer)) {
    const importPlusOne = importDirs[2];

    return `${start}${importLayer}/${importSlice}/${importPlusOne}'`;
  }
  return `${start}${importLayer}/${importSlice}'`;
}
