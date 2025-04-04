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
 * @typedef {{ [signature: string]: string | google.maps.TravelMode | { text: string, value: number }, travelMode: google.maps.TravelMode, distance: { text: string, value: number }, duration: { text: string, value: number } }} DistanceResult
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
 * @property {string} [back]
 * @property {string} [fore]
 * @property {string} [font]
 * @property {string} [border]
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