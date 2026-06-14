"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const path_1 = __importDefault(require("path"));
const isPathRelative_1 = require("../shared/isPathRelative");
const layers = {
    shared: 1,
    entities: 2,
    features: 3,
    widgets: 4,
    pages: 5,
};
exports.rules = {
    meta: {
        type: "problem",
        defaultOptions: [{}],
        docs: {
            description: "Проверяет относительные пути внутри одного FSD-слайса",
            recommended: false,
            url: undefined,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                description: "Path checker rule options.",
                properties: {
                    alias: {
                        type: "string",
                        description: "Alias used for absolute imports.",
                    },
                },
                layersPlusOne: {
                    type: "array",
                    description: "Layers that include one extra public API segment.",
                    items: {
                        type: "string",
                    },
                },
            },
        ],
        messages: {
            errorPathMessage: "В рамках одного слайса все пути должны быть относительными",
        },
    },
    create(context) {
        const options = (context.options[0] || {});
        const alias = options.alias || "";
        const fromFilename = context.filename;
        const pathFrom = getNormalizedCurrentFilePath(fromFilename);
        if (pathFrom === undefined) {
            return {};
        }
        const pathArray = pathFrom.split("/");
        const fromLayer = pathArray[1];
        if (!Object.prototype.hasOwnProperty.call(layers, fromLayer)) {
            return {};
        }
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
                if (shouldBeRelative(pathArray, importTo)) {
                    context.report({
                        node,
                        messageId: "errorPathMessage",
                        fix: (fixer) => {
                            const normalizedPath = pathFrom
                                .split("/")
                                .join("/"); // путь файла без названия файла (директория файла)
                            let relativePath = path_1.default
                                .relative(normalizedPath, `/${importTo}`)
                                .split("\\")
                                .join("/");
                            if (!relativePath.startsWith(".")) {
                                relativePath = "./" + relativePath;
                            }
                            return fixer.replaceTextRange(importNode.source.range, `'${relativePath}'`);
                        },
                    });
                }
            },
        };
    },
};
function getNormalizedCurrentFilePath(currentFilePath) {
    const normalizedPath = path_1.default.toNamespacedPath(currentFilePath);
    const projectFrom = normalizedPath.split("src")[1];
    if (projectFrom === undefined) {
        return undefined;
    }
    return projectFrom.split("\\").join("/");
}
function shouldBeRelative(fromArray, to) {
    if ((0, isPathRelative_1.isPathRelative)(to)) {
        return false;
    }
    // example entities/Article
    const toArray = to.split("/");
    const toLayer = toArray[0]; // entities
    const toSlice = toArray[1]; // Article
    if (!toLayer ||
        !toSlice ||
        !Object.prototype.hasOwnProperty.call(layers, toLayer)) {
        return false;
    }
    const fromLayer = fromArray[1];
    const fromSlice = fromArray[2];
    if (fromSlice === toSlice && toLayer === fromLayer) {
        return true;
    }
    return false;
}
//# sourceMappingURL=path-checker.js.map