/**
 * @typedef {import('./types.js').UIColor} UIColor
 */

/**
 * 
 * @param {string} property 
 * @param {string} color 
 */
function setColorVars(property, color) {
    document.documentElement.style.setProperty(property, color)
}

/**
 * 
 * @param {UIColor} color
 */
function setSelectionColors(color) {
    setColorVars("--selection-back-color", color.back)
    setColorVars("--selection-font-color", color.font)
}

/**
 * 
 * @param {UIColor} color 
 */
function setScrollbarColors(color) {
    setColorVars("--scrollbar-thumb-color", color.font)
    setColorVars("--scrollbar-track-color", color.back)
}

const Style = {
    setSelectionColors: setSelectionColors,
    setScrollbarColors: setScrollbarColors
}

export default Style