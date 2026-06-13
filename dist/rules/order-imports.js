"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const isPathRelative_1 = require("../shared/isPathRelative");
exports.rules = {
    meta: {
        type: "layout",
        defaultOptions: [{}],
        docs: {
            description: "Checks the import sequence",
            recommended: false,
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                description: "Import ordering rule options.",
                properties: {
                    alias: {
                        type: "string",
                        description: "Alias used for absolute imports.",
                    },
                    otherImport: {
                        type: "array",
                        description: "Additional absolute import groups.",
                        items: {
                            type: "string",
                        },
                    },
                },
            },
        ],
        messages: {
            invalidOrder: "Импорт {{first}} должен быть раньше, чем импорт {{next}}",
        },
    },
    create(context) {
        const options = (context.options[0] || {});
        const alias = options.alias || "";
        const otherImport = options.otherImport || [];
        const defineClassPriorityImport = defineClassPriority(otherImport);
        let classPriorityMax;
        let priorityMax = 0;
        let nodeMax;
        const importDict = createImportDict();
        return {
            "Program:exit": (node) => {
                if (nodeMax) {
                    const { range, orderCode } = orderedImports(importDict);
                    const canFix = isCanFix(node);
                    context.report({
                        node: nodeMax.node,
                        messageId: "invalidOrder",
                        data: nodeMax.data,
                        fix: canFix
                            ? (fixer) => fixer.replaceTextRange(range, orderCode)
                            : undefined,
                    });
                }
            },
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
                const classPriority = defineClassPriorityImport(importTo);
                const priorityNow = importPriority[classPriority];
                importDict[classPriority].push({
                    node: importNode,
                    range: importNode.range,
                });
                if (priorityNow > priorityMax) {
                    classPriorityMax = classPriority;
                    priorityMax = priorityNow;
                }
                if (priorityNow < priorityMax && classPriorityMax) {
                    const messFirst = messageClassPriority[classPriority];
                    const messNext = messageClassPriority[classPriorityMax];
                    const data = {
                        first: messFirst,
                        next: messNext,
                    };
                    if (!nodeMax) {
                        nodeMax = {
                            node: importNode,
                            data,
                        };
                    }
                    else {
                        context.report({
                            node,
                            messageId: "invalidOrder",
                            data,
                        });
                    }
                }
            },
        };
    },
};
const layers = {
    shared: "publicShared",
    entities: "publicEntities",
    features: "publicFeatures",
    widgets: "publicWidgets",
    pages: "publicPages",
};
const importPriority = {
    library: 1.0,
    publicShared: 2.0,
    publicEntities: 2.1,
    publicFeatures: 2.2,
    publicWidgets: 2.3,
    publicPages: 2.4,
    publicOther: 2.5,
    relative: 3.0,
    css: 4.0,
};
const messageClassPriority = {
    library: "LIBRARY",
    publicShared: "SHARED",
    publicEntities: "ENTITIES",
    publicFeatures: "FEATURES",
    publicWidgets: "WIDGETS",
    publicPages: "PAGE",
    publicOther: "OTHER",
    relative: "RELATIVE",
    css: "STYLE",
};
const styleExpansion = ["scss", "css"];
const defineClassPriority = (otherImport) => (importTo) => {
    if ((0, isPathRelative_1.isPathRelative)(importTo)) {
        const importExpansion = importTo.split(".").pop() || "";
        if (styleExpansion.includes(importExpansion)) {
            return "css";
        }
        return "relative";
    }
    const importLayer = importTo.split("/")[0];
    if (otherImport.includes(importLayer)) {
        return "publicOther";
    }
    if (!Object.prototype.hasOwnProperty.call(layers, importLayer)) {
        return "library";
    }
    return layers[importLayer];
};
function createImportDict() {
    return {
        library: [],
        publicShared: [],
        publicEntities: [],
        publicFeatures: [],
        publicWidgets: [],
        publicPages: [],
        publicOther: [],
        relative: [],
        css: [],
    };
}
function orderedImports(importDict) {
    const importClasses = Object.keys(importPriority);
    const orderCode = [];
    const range = [0, 0];
    for (const importClass of importClasses) {
        const importList = importDict[importClass];
        for (const importEntry of importList) {
            orderCode.push(createImport(importEntry.node));
            if (importEntry.range[1] > range[1]) {
                range[1] = importEntry.range[1];
            }
        }
        if (importClass === "library" || importClass === "publicOther") {
            orderCode.push("");
        }
    }
    if (orderCode[orderCode.length - 1] === "") {
        orderCode.pop();
    }
    return { orderCode: orderCode.join("\n"), range };
}
function isCanFix(nodes) {
    let endImports = false;
    return !nodes.body.some((node) => {
        if (node.type !== "ImportDeclaration") {
            endImports = true;
        }
        if (endImports && node.type === "ImportDeclaration") {
            return true;
        }
        return false;
    });
}
function createImport(node) {
    const source = node.source.value;
    if (node.specifiers.length === 0) {
        return `import '${source}';`;
    }
    const defaultSpecifier = node.specifiers.find((specifier) => specifier.type === "ImportDefaultSpecifier");
    const namespaceSpecifier = node.specifiers.find((specifier) => specifier.type === "ImportNamespaceSpecifier");
    const namedSpecifiers = node.specifiers.filter((specifier) => specifier.type === "ImportSpecifier");
    const importType = node.importKind === "type" ? " type" : "";
    const importParts = [];
    if (defaultSpecifier) {
        importParts.push(defaultSpecifier.local.name);
    }
    if (namespaceSpecifier) {
        importParts.push(`* as ${namespaceSpecifier.local.name}`);
    }
    if (namedSpecifiers.length > 0) {
        importParts.push(`{ ${namedSpecifiers.map((specifier) => {
            const importedName = getImportedName(specifier.imported);
            const importKind = node.importKind !== "type" && specifier.importKind === "type"
                ? "type "
                : "";
            if (importedName === specifier.local.name) {
                return `${importKind}${specifier.local.name}`;
            }
            return `${importKind}${importedName} as ${specifier.local.name}`;
        }).join(", ")} }`);
    }
    return `import${importType} ${importParts.join(", ")} from '${source}';`;
}
function getImportedName(imported) {
    if (imported.type === "Identifier") {
        return imported.name;
    }
    return JSON.stringify(imported.value);
}
//# sourceMappingURL=order-imports.js.map