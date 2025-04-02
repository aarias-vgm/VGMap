// GeoJSON

/**
 * @typedef {GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, Record<string, any>>} Feature
 */

/**
 * @typedef {GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, Record<string, any>>} FeatureCollection
 */

// Map

/**
 * @typedef {{ [signature: string]: string | google.maps.TravelMode | { text: string, value: number }, travelMode: google.maps.TravelMode, distance: { text: string, value: number }, duration: { text: string, value: number } }} DistanceLine

// HTML

/**
 * @callback TooltipHandler
 * @param {MouseEvent | google.maps.Data.MouseEvent} event
 * @returns {void}
 */

/**
 * @typedef {"in" | "out" | "click" | "move"} TooltipEventType
 */

// Map

/**
 * @typedef {Object} LatLng
 * @property {string} lat
 * @property {string} lng
 */

/**
 * @typedef {Object} DataMouseEvent
 * @property {google.maps.Data.Feature} feature
 * @property {google.maps.LatLng} latLng
 * @property {MouseEvent} domEvent
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