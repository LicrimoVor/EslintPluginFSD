export function isPathRelative(path: string): boolean {
	return path === "." || path.startsWith("./") || path.startsWith("../");
}
