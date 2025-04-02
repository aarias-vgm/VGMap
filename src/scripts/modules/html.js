/**
 * 
 * @param {HTMLElement} element 
 * @returns {{x: number, y: number, w: number, h: number}}
 */
function getRect(element) {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, w: rect.width, h: rect.height }
}

const HTML = {
    getRect: getRect
}

export default HTML