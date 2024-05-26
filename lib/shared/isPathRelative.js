module.exports = function isPathRelative(path) {
    return path === '.' || path.startsWith('./') || path.startsWith('../')
}