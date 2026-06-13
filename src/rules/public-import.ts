import type { Rule } from "eslint";
import type { TSESTree } from "@typescript-eslint/utils";
import micromatch from "micromatch";

import { isPathRelative } from "../shared/isPathRelative";

const layers = ["shared", "entities", "features", "widgets", "pages"];

type ImportKind = "type" | "value";

type RuleOptions = {
	alias?: string;
	otherIgnoreLayer?: string[];
	layersPlusOne?: string[];
	otherPublicImport?: string;
	otherPublicPatterns?: string[];
	sharedEnclosure?: string[];
	widgetEnclosure?: string[];
	featuresEnclosure?: string[];
	pageEnclosure?: string[];
};

type Enclosures = Pick<
	RuleOptions,
	| "sharedEnclosure"
	| "widgetEnclosure"
	| "featuresEnclosure"
	| "pageEnclosure"
>;

export const rules: Rule.RuleModule = {
	meta: {
		type: "problem",
		defaultOptions: [{}],
		docs: {
			description: "Checking the import from the index.ts public",
			recommended: false,
		},
		fixable: "code",
		schema: [
			{
				type: "object",
				description: "Public import rule options.",
				properties: {
					alias: {
						type: "string",
						description: "Alias used for absolute imports.",
					},
					otherIgnoreLayer: {
						type: "array",
						description: "Layers ignored for secondary public API checks.",
						items: {
							type: "string",
						},
					},
					layersPlusOne: {
						type: "array",
						description: "Layers that include one extra public API segment.",
						items: {
							type: "string",
						},
					},
					otherPublicImport: {
						type: "string",
						description: "Secondary public API segment name.",
					},
					otherPublicPatterns: {
						type: "array",
						description: "Filename patterns allowed to import secondary public APIs.",
						items: {
							type: "string",
						},
					},
					sharedEnclosure: {
						type: "array",
						description: "Shared slices with enclosed public APIs.",
						items: {
							type: "string",
						},
					},
					widgetEnclosure: {
						type: "array",
						description: "Widget slices with enclosed public APIs.",
						items: {
							type: "string",
						},
					},
					featuresEnclosure: {
						type: "array",
						description: "Feature slices with enclosed public APIs.",
						items: {
							type: "string",
						},
					},
					pageEnclosure: {
						type: "array",
						description: "Page slices with enclosed public APIs.",
						items: {
							type: "string",
						},
					},
				},
			},
		],
		messages: {
			errorPathMessage: "Импорт должен быть из public API",
			errorOtherImport: "Нельзя импоритровать из testing-API",
		},
	},

	create(context: Rule.RuleContext): Rule.RuleListener {
		const {
			alias = "",
			otherPublicPatterns = [],
			otherPublicImport = "testing",
			layersPlusOne = [],
			otherIgnoreLayer,
			...enclosures
		} = (context.options[0] || {}) as RuleOptions;

		const isOther = otherPublicPatterns.some((pattern) =>
			micromatch.isMatch(context.filename, pattern),
		);

		return {
			ImportDeclaration(node) {
				const importNode = node as unknown as TSESTree.ImportDeclaration;

				if (isTypeOnlyImport(importNode)) {
					return;
				}

				const importWithAlias = importNode.source.value;
				let importTo = importWithAlias;

				if (alias) {
					const importToMassive = importWithAlias.split(`${alias}/`);
					importTo =
						importToMassive.length > 1
							? importToMassive[1]
							: importToMassive[0];
				}

				if (isOther) {
					const isIgnore = otherIgnoreLayer
						? !otherIgnoreLayer.some((layer) =>
								importTo.includes(layer),
							)
						: true;
					if (
						isIgnore &&
						checkOtherImportPublic(
							importTo,
							otherPublicImport,
							layersPlusOne,
							enclosures,
						)
					) {
						context.report({
							node,
							messageId: "errorPathMessage",
							fix: (fixer) =>
								fixer.replaceTextRange(
									importNode.source.range,
									fixImport(
										importTo,
										alias,
										layersPlusOne,
										enclosures,
									),
								),
						});
					}
				} else {
					if (
						checkImportPublic(importTo, layersPlusOne, enclosures)
					) {
						context.report({
							node,
							messageId: "errorPathMessage",
							fix: (fixer) =>
								fixer.replaceTextRange(
									importNode.source.range,
									fixImport(
										importTo,
										alias,
										layersPlusOne,
										enclosures,
									),
								),
						});
					}

					if (otherPublicImport.includes(importTo.split("/").pop() || "")) {
						context.report({
							node,
							messageId: "errorOtherImport",
							fix: (fixer) =>
								fixer.replaceTextRange(
									importNode.source.range,
									fixImport(
										importTo,
										alias,
										layersPlusOne,
										enclosures,
									),
								),
						});
					}
				}
			},
		};
	},
};

function checkImportPublic(
	to: string,
	layersPlusOne: string[],
	enclosures: Enclosures,
): boolean {
	if (isPathRelative(to)) {
		return false;
	}

	const importDirs = Array.from(to.split("/"));

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

function checkOtherImportPublic(
	to: string,
	otherPublicImport: string,
	layersPlusOne: string[],
	enclosures: Enclosures,
): boolean {
	if (isPathRelative(to)) {
		return false;
	}

	const importDirs = Array.from(to.split("/"));

	if (importDirs.length < 2) {
		return false;
	}

	const importLayer = importDirs[0];
	const importSlice = importDirs[1];
	const importPublic = importDirs[importDirs.length - 1];

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

function isEnclosure(
	importLayer: string,
	importSlice: string,
	enclosures: Enclosures,
): boolean {
	const {
		sharedEnclosure = [],
		featuresEnclosure = [],
		pageEnclosure = [],
		widgetEnclosure = [],
	} = enclosures;

	if (importLayer === "shared" && sharedEnclosure.includes(importSlice)) {
		return true;
	}
	if (importLayer === "features" && featuresEnclosure.includes(importSlice)) {
		return true;
	}
	if (importLayer === "widgets" && widgetEnclosure.includes(importSlice)) {
		return true;
	}
	if (importLayer === "pages" && pageEnclosure.includes(importSlice)) {
		return true;
	}
	return false;
}

function fixImport(
	importTo: string,
	alias: string,
	layersPlusOne: string[],
	enclosures: Enclosures,
): string {
	const importDirs = Array.from(importTo.split("/"));
	const start = alias ? `'${alias}/` : "'";

	const importLayer = importDirs[0];
	const importSlice = importDirs[1];

	if (isEnclosure(importLayer, importSlice, enclosures)) {
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

function isTypeOnlyImport(node: TSESTree.ImportDeclaration): boolean {
	if (node.importKind === "type") {
		return true;
	}

	if (node.specifiers.length === 0) {
		return false;
	}

	return node.specifiers.every((specifier) => {
		const importKind = "importKind" in specifier
			? (specifier.importKind as ImportKind | undefined)
			: undefined;

		return importKind === "type";
	});
}
