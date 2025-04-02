/**
 * @typedef {import('./types.js').Color} Color
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
 * @param {Color} color
 */
function setSelectionColors(color) {
    setColorVars("--selection-back-color", color.back || "")
    setColorVars("--selection-font-color", color.font || "")
}

/**
 * 
 * @param {Color} color 
 */
function setScrollbarColors(color) {
    setColorVars("--scrollbar-thumb-color", color.fore || "")
    setColorVars("--scrollbar-track-color", color.back || "")
}

const Style = {
    setSelectionColors: setSelectionColors,
    setScrollbarColors: setScrollbarColors
}

export default Style