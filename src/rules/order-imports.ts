import type { Rule } from "eslint";
import type { TSESTree } from "@typescript-eslint/utils";
import { isPathRelative } from "../shared/isPathRelative";

type RuleOptions = {
	alias?: string;
	otherImport?: string[];
};

type ImportClass = keyof typeof importPriority;

type ImportEntry = {
	node: TSESTree.ImportDeclaration;
	classPriority: ImportClass;
	range: TSESTree.Range;
};

type ImportReport = {
	node: TSESTree.ImportDeclaration;
	data: {
		first: string;
		next: string;
	};
};

export const rules: Rule.RuleModule = {
	meta: {
		type: "layout",
		defaultOptions: [{}],
		docs: {
			description: "Проверяет порядок импортов",
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
			invalidOrder:
				"Импорт {{first}} должен быть раньше, чем импорт {{next}}",
		},
	},

	create(context: Rule.RuleContext): Rule.RuleListener {
		const options = (context.options[0] || {}) as RuleOptions;
		const alias = options.alias || "";
		const otherImport = options.otherImport || [];
		const defineClassPriorityImport = defineClassPriority(otherImport);
		let classPriorityMax: ImportClass | undefined;
		let priorityMax = 0;
		let nodeMax: ImportReport | undefined;

		const importEntries: ImportEntry[] = [];

		return {
			"Program:exit": (node) => {
				if (nodeMax) {
					const program = node as unknown as TSESTree.Program;
					const importGroup = getContiguousImportGroup(
						program,
						importEntries,
						nodeMax.node,
					);
					const fixData =
						importGroup.length > 1
							? orderedImports(entriesToImportDict(importGroup))
							: undefined;

					context.report({
						node: nodeMax.node as unknown as Rule.Node,
						messageId: "invalidOrder",
						data: nodeMax.data,
						fix: fixData
							? (fixer) =>
									fixer.replaceTextRange(
										fixData.range,
										fixData.orderCode,
									)
							: undefined,
					});
				}
			},
			ImportDeclaration(node) {
				const importNode = node as unknown as TSESTree.ImportDeclaration;
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
				importEntries.push({
					node: importNode,
					classPriority,
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
					} else {
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

const layers: Record<string, ImportClass> = {
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
} as const;

const messageClassPriority: Record<ImportClass, string> = {
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

const defineClassPriority =
	(otherImport: string[]) =>
	(importTo: string): ImportClass => {
		if (isPathRelative(importTo)) {
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

function createImportDict(): Record<ImportClass, ImportEntry[]> {
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

function orderedImports(importDict: Record<ImportClass, ImportEntry[]>): {
	orderCode: string;
	range: TSESTree.Range;
} {
	const importClasses = Object.keys(importPriority) as ImportClass[];
	const orderCode: string[] = [];
	const range: TSESTree.Range = [Number.POSITIVE_INFINITY, 0];

	for (const importClass of importClasses) {
		const importList = importDict[importClass];

		for (const importEntry of importList) {
			orderCode.push(createImport(importEntry.node));

			if (importEntry.range[0] < range[0]) {
				range[0] = importEntry.range[0];
			}
			if (importEntry.range[1] > range[1]) {
				range[1] = importEntry.range[1];
			}
		}

		if (shouldAddGroupSeparator(importClass, importClasses, importDict)) {
			orderCode.push("");
		}
	}

	if (orderCode[orderCode.length - 1] === "") {
		orderCode.pop();
	}
	return { orderCode: orderCode.join("\n"), range };
}

function shouldAddGroupSeparator(
	importClass: ImportClass,
	importClasses: ImportClass[],
	importDict: Record<ImportClass, ImportEntry[]>,
): boolean {
	if (importClass === "library") {
		return importDict.library.length > 0;
	}

	if (importClass !== "publicOther") {
		return false;
	}

	const hasPreviousImports = importClasses
		.slice(0, importClasses.indexOf(importClass) + 1)
		.some((className) => importDict[className].length > 0);
	const hasFollowingImports = importClasses
		.slice(importClasses.indexOf(importClass) + 1)
		.some((className) => importDict[className].length > 0);

	return hasPreviousImports && hasFollowingImports;
}

function entriesToImportDict(
	importEntries: ImportEntry[],
): Record<ImportClass, ImportEntry[]> {
	const importDict = createImportDict();

	for (const importEntry of importEntries) {
		importDict[importEntry.classPriority].push(importEntry);
	}

	return importDict;
}

function getContiguousImportGroup(
	program: TSESTree.Program,
	importEntries: ImportEntry[],
	targetNode: TSESTree.ImportDeclaration,
): ImportEntry[] {
	const groups: TSESTree.ImportDeclaration[][] = [];
	let currentGroup: TSESTree.ImportDeclaration[] = [];

	for (const statement of program.body) {
		if (statement.type === "ImportDeclaration") {
			currentGroup.push(statement);
			continue;
		}

		if (currentGroup.length > 0) {
			groups.push(currentGroup);
			currentGroup = [];
		}
	}

	if (currentGroup.length > 0) {
		groups.push(currentGroup);
	}

	const targetGroup = groups.find((group) =>
		group.some((node) => node.range[0] === targetNode.range[0]),
	);

	if (!targetGroup) {
		return [];
	}

	return importEntries.filter((entry) =>
		targetGroup.some((node) => node.range[0] === entry.node.range[0]),
	);
}

function createImport(node: TSESTree.ImportDeclaration): string {
	const source = node.source.value;

	if (node.specifiers.length === 0) {
		return `import '${source}';`;
	}

	const defaultSpecifier = node.specifiers.find(
		(specifier): specifier is TSESTree.ImportDefaultSpecifier =>
			specifier.type === "ImportDefaultSpecifier",
	);
	const namespaceSpecifier = node.specifiers.find(
		(specifier): specifier is TSESTree.ImportNamespaceSpecifier =>
			specifier.type === "ImportNamespaceSpecifier",
	);
	const namedSpecifiers = node.specifiers.filter(
		(specifier): specifier is TSESTree.ImportSpecifier =>
			specifier.type === "ImportSpecifier",
	);
	const importType = node.importKind === "type" ? " type" : "";
	const importParts: string[] = [];

	if (defaultSpecifier) {
		importParts.push(defaultSpecifier.local.name);
	}

	if (namespaceSpecifier) {
		importParts.push(`* as ${namespaceSpecifier.local.name}`);
	}

	if (namedSpecifiers.length > 0) {
		importParts.push(`{ ${namedSpecifiers.map((specifier) => {
			const importedName = getImportedName(specifier.imported);
			const importKind =
				node.importKind !== "type" && specifier.importKind === "type"
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

function getImportedName(
	imported: TSESTree.Identifier | TSESTree.StringLiteral,
): string {
	if (imported.type === "Identifier") {
		return imported.name;
	}

	return JSON.stringify(imported.value);
}
