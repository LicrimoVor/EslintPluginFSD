"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPathRelative = isPathRelative;
function isPathRelative(path) {
    return path === "." || path.startsWith("./") || path.startsWith("../");
}
//# sourceMappingURL=isPathRelative.js.map