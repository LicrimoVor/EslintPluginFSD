import type { Rule } from "eslint";
import type { TSESTree } from "@typescript-eslint/utils";
import path from "path";
import { isPathRelative } from "../shared/isPathRelative";

const layers: Record<string, number> = {
	shared: 1,
	entities: 2,
	features: 3,
	widgets: 4,
	pages: 5,
};

type RuleOptions = {
	alias?: string;
};

export const rules: Rule.RuleModule = {
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
			errorPathMessage:
				"В рамках одного слайса все пути должны быть относительными",
		},
	},

	create(context: Rule.RuleContext): Rule.RuleListener {
		const options = (context.options[0] || {}) as RuleOptions;
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

				if (shouldBeRelative(pathArray, importTo)) {
					context.report({
						node,
						messageId: "errorPathMessage",
						fix: (fixer) => {
							const normalizedPath = pathFrom
								.split("/")
								.join("/"); // путь файла без названия файла (директория файла)
							let relativePath = path
								.relative(normalizedPath, `/${importTo}`)
								.split("\\")
								.join("/");

							if (!relativePath.startsWith(".")) {
								relativePath = "./" + relativePath;
							}
							return fixer.replaceTextRange(
								importNode.source.range,
								`'${relativePath}'`,
							);
						},
					});
				}
			},
		};
	},
};

function getNormalizedCurrentFilePath(
	currentFilePath: string,
): string | undefined {
	const normalizedPath = path.toNamespacedPath(currentFilePath);
	const projectFrom = normalizedPath.split("src")[1];

	if (projectFrom === undefined) {
		return undefined;
	}

	return projectFrom.split("\\").join("/");
}

function shouldBeRelative(fromArray: string[], to: string): boolean {
	if (isPathRelative(to)) {
		return false;
	}

	// example entities/Article
	const toArray = to.split("/");
	const toLayer = toArray[0]; // entities
	const toSlice = toArray[1]; // Article

	if (
		!toLayer ||
		!toSlice ||
		!Object.prototype.hasOwnProperty.call(layers, toLayer)
	) {
		return false;
	}

	const fromLayer = fromArray[1];
	const fromSlice = fromArray[2];

	if (fromSlice === toSlice && toLayer === fromLayer) {
		return true;
	}

	return false;
}
