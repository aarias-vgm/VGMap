// GeoJSON

/**
 * @typedef {GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, Record<string, any>>} Feature
 */

/**
 * @typedef {GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, Record<string, any>>} FeatureCollection
 */

// Marker

/**
 * @typedef {new (map: google.maps.Map, coords: google.maps.LatLng, className: string, innerHtml: string) => google.maps.OverlayView} DomMarker
*/

// HTML

/**
 * @typedef {{x: number, y: number, w: number, h: number}} Rect
 */

// Map

/**
 * @typedef {{lat: number, lng: number}} Coords
 */

/**
 * @typedef {Object} Distance
 * @property {{ text: string, value: number }} distance
 * @property {{ text: string, value: number }} duration
 */

/**
 * @typedef {{place1Id: string, place2Id: string, travelMode: google.maps.TravelMode, distance: { text: string, value: number }, duration: { text: string, value: number } }} DistanceLine
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
 */

/**
 * @typedef {Object} UIColor
 * @property {string} back
 * @property {string} font
 * @property {string} border
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