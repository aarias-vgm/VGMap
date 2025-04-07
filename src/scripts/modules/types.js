// GeoJSON

/**
 * @typedef {GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, Record<string, any>>} Feature
 */

/**
 * @typedef {GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, Record<string, any>>} FeatureCollection
 */

// Tooltip

/**
 * @callback TooltipHandler
 * @param {any} event
 * @returns {any}
 */

/**
 * @typedef {"in" | "out" | "click" | "move"} EventType
 */

// HTML

/**
 * @typedef {{x: number, y: number, w: number, h: number}} Rect
 */

// Map

/**
 * @typedef {Object} Distance
 * @property {{ text: string, value: number }} distance
 * @property {{ text: string, value: number }} duration
 */

/**
 * @typedef {{place1Id: string, place2Id: string, travelMode: google.maps.TravelMode, distance: { text: string, value: number }, duration: { text: string, value: number } }} DistanceLine
 */

/**
 * @typedef {Object} LatLng
 * @property {string} lat
 * @property {string} lng
 */

/**
 * @typedef {google.maps.Data} MapData
 */

/**
 * @typedef {google.maps.Data.Feature} MapFeature
 */

/**
 * @typedef {google.maps.Data.MouseEvent & {domEvent: {clientX: number, clientY: number}}} MapEvent
 */

// Colors

/**
 * @typedef {Object} Color
 * @property {string} back
 * @property {string} fore
 * @property {string} accent
 * @property {string} [accent2]
 */

/**
* @typedef {Object} PinColor
* @property {string} background
* @property {string} border
* @property {string} glyph
* @property {string} hoverBackground
* @property {string} hoverBorder
* @property {string} hoverGlyph
*/

export { };