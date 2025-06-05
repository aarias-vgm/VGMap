import { createDomMarkerClass } from '../components/domMarker.js';

/**
 * @typedef {import('../utils/types.js').DomMarker} DomMarker
 */

export default class DomMarkerController {

    /**
     * 
     * @param {google.maps.Map} map 
     */
    constructor(map) {
        this.map = map;

        /** @type {DomMarker} */
        this.DomMarker
    }

    async init() {
        // @ts-ignore
        const { OverlayView } = await google.maps.importLibrary("streetView");

        this.DomMarker = createDomMarkerClass(OverlayView);
    }

    /**
     * @param {google.maps.LatLng} coords
     * @param {string} className
     * @param {string} innerHtml
     */
    addDomMarker(coords, className, innerHtml) {
        return new this.DomMarker(this.map, coords, className, innerHtml);
    }
}