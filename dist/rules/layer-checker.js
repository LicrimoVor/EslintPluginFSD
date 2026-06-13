"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const isPathRelative_1 = require("../shared/isPathRelative");
exports.rules = {
    meta: {
        type: "problem",
        defaultOptions: [{}],
        docs: {
            description: "Проверяет импорт по уровню доступа FSD",
            recommended: false,
        },
        schema: [
            {
                type: "object",
                description: "Layer checker rule options.",
                properties: {
                    alias: {
                        type: "string",
                        description: "Alias used for absolute imports.",
                    },
                },
            },
        ],
        messages: {
            errorPathMessage: "Импорт из верхних частей FSD структуры невозможен",
        },
    },
    create(context) {
        const options = (context.options[0] || {});
        const alias = options.alias || "";
        const filename = context.filename;
        const layer = filename ? defineLayer(filename) : undefined;
        return {
            ImportDeclaration(node) {
                const importNode = node;
                const importWithAlias = importNode.source.value;
                let importTo = importWithAlias;
                if (alias) {
                    const importToMassive = importWithAlias.split(`${alias}/`);
                    importTo =
                        importToMassive.length > 1
                            ? importToMassive[1]
                            : importToMassive[0];
                }
                if (layer && validateLayerImport(layer, importTo)) {
                    context.report({
                        node,
                        messageId: "errorPathMessage",
                    });
                }
            },
        };
    },
};
const layerCorrectImports = {
    shared: ["shared"],
    entities: ["shared", "entities"],
    features: ["shared", "entities"],
    widgets: ["shared", "entities", "features"],
    pages: ["shared", "entities", "features", "widgets"],
    app: ["shared", "entities", "features", "widgets", "pages"],
};
function validateLayerImport(layer, importTo) {
    if ((0, isPathRelative_1.isPathRelative)(importTo)) {
        return false;
    }
    const importLayer = importTo.split("/")[0];
    const correctImports = layerCorrectImports[layer] || [];
    if (!Object.keys(layerCorrectImports).includes(importLayer)) {
        return false;
    }
    return !correctImports.includes(importLayer);
}
function defineLayer(filename) {
    const dirs = filename.split("\\");
    let layer;
    for (let i = dirs.length - 1; i > 0; i -= 1) {
        if (Object.keys(layerCorrectImports).includes(dirs[i])) {
            layer = dirs[i];
        }
    }
    return layer;
}
//# sourceMappingURL=layer-checker.js.map