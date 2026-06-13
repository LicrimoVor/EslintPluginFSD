import { rules as layerChecker } from "./rules/layer-checker";
import { rules as orderImports } from "./rules/order-imports";
import { rules as pathChecker } from "./rules/path-checker";
import { rules as publicImport } from "./rules/public-import";

export const rules = {
	"layer-checker": layerChecker,
	"order-imports": orderImports,
	"path-checker": pathChecker,
	"public-import": publicImport,
};

export default {
	rules,
};

