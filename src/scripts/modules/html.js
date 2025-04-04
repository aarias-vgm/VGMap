/**
 * @typedef {import('./types.js').Rect} Rect
 */

/**
 * 
 * @param {HTMLElement} element 
 * @returns {Rect}
 */
function getRect(element) {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, w: rect.width, h: rect.height }
}

const HTML = {
    getRect: getRect
}

export default HTML