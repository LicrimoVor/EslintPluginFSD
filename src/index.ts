//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import requireIndex from "requireindex";
import path from "node:path";
import { fileURLToPath } from "node:url";

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const rules = requireIndex(path.join(dirname, "rules"));


