"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const layer_checker_1 = require("./rules/layer-checker");
const order_imports_1 = require("./rules/order-imports");
const path_checker_1 = require("./rules/path-checker");
const public_import_1 = require("./rules/public-import");
exports.rules = {
    "layer-checker": layer_checker_1.rules,
    "order-imports": order_imports_1.rules,
    "path-checker": path_checker_1.rules,
    "public-import": public_import_1.rules,
};
exports.default = {
    rules: exports.rules,
};
//# sourceMappingURL=index.js.map