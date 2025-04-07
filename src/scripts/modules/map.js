import { MAPCENTER, MAPID, DIANKEY } from './constants.js';
import { Place } from './classes.js';

/**
 * @typedef {import('./types.js').Color} Color
 * @typedef {import('./types.js').PinColor} PinColor
 * @typedef {import('./types.js').Distance} Distance
 */

export default class Map {

    static polygonIndex = 0

    /** @type {google.maps.Map} */
    map
    /** @type {google.maps.marker.PinElement} */
    pinElement
    /** @type {google.maps.marker.AdvancedMarkerElement} */
    advancedMarkerElement
    /** @type {google.maps.DistanceMatrixService} */
    distanceMatrixService
    /** @type {google.maps.places.PlacesService} */
    placesService
    /** @type {google.maps.Geocoder} */
    geocoder
    /** @type {HTMLElement} */
    areaTooltip

    constructor() {
        // @ts-ignore
        this.map = undefined
        // @ts-ignore
        this.pinElement = undefined
        // @ts-ignore
        this.advancedMarkerElement = undefined
        // @ts-ignore
        this.distanceMatrixService = undefined
        // @ts-ignore
        this.placesService = undefined
        // @ts-ignore
        this.geocoder = undefined
        // @ts-ignore
        this.areaTooltip = document.getElementById("area-tooltip")
    }

    async runAPI() {
        (g => {
            // @ts-ignore
            var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n))
        })({
            key: DIANKEY,
            v: "weekly" // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
            // Add other bootstrap parameters as needed, using camel case.
        });

        // @ts-ignore
        const { Map } = await google.maps.importLibrary("maps")

        this.mapElement = document.getElementById("map")

        this.map = new Map(this.mapElement, {
            mapId: MAPID,
            zoom: 5.8,
            maxZoom: 50,
            minZoom: 2,
            // styles: MAPSTYLES,
            cameraControl: false,
            clickableIcons: false,
            disableDefaultUI: true,
            fullscreenControl: true,
            mapTypeControl: false,
            rotateControl: false,
            scaleControl: false,
            streetViewControl: true,
            zoomControl: true,
        });

        this.map.setCenter(MAPCENTER)

    }

    async importPinElement() {
        // @ts-ignore
        const { PinElement } = await google.maps.importLibrary("marker")
        this.pinElement = PinElement
    }

    async importAdvancedMarkerElement() {
        // @ts-ignore
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker")
        this.advancedMarkerElement = AdvancedMarkerElement
    }

    async importDistanceService() {
        // @ts-ignore
        const { DistanceMatrixService } = await google.maps.importLibrary("routes")
        this.distanceMatrixService = DistanceMatrixService
    }

    async importGeocoderService() {
        // @ts-ignore
        const { Geocoder } = await google.maps.importLibrary("geocoding");
        this.geocoder = Geocoder
    }

    async importPlacesService() {
        // @ts-ignore
        // const { PlacesService } = await google.maps.importLibrary("places");
        const { PlacesService } = await google.maps.importLibrary("places");
        this.placesService = PlacesService
    }

    /**
     * 
     * @param {Place} element 
     * @param {string} elementType 
     * @param {string} faIcon 
     * @param {Color} color 
     * @param {Color?} hoverColor 
     * @returns {Promise<google.maps.marker.AdvancedMarkerElement>}
     */
    async createMarker(element, elementType, faIcon, color, hoverColor = null) {

        if (!hoverColor) {
            hoverColor = color
        }

        const icon = document.createElement("div");

        icon.innerHTML = `
            <div name="${element.name}" lat="${element.lat}" lng="${element.lng}">
                <i class="fa ${faIcon} fa-xl"></i> 
            </div>
        `

        // @ts-ignore
        const pin = new this.pinElement({
            glyph: icon,
            background: color.back,
            glyphColor: color.fore,
            borderColor: color.accent,
            scale: 1,
        });

        // @ts-ignore
        const marker = new this.advancedMarkerElement({
            map: this.map,
            position: element.getLatLng(),
            content: pin.element,
            title: `${elementType}: ${element.name}`,
            zIndex: 999,
            draggable: false,
            gmpClickable: true,
            collisionBehavior: "REQUIRED",
        });

        marker.element.style.background = "transparent"

        marker.element.querySelectorAll('*').forEach((/** @type {HTMLElement} */ child) => {
            child.style.zIndex = "0"
            child.style.pointerEvents = 'none';
        });

        pin.element.querySelectorAll('*').forEach((/** @type {HTMLElement} */ child) => {
            child.style.zIndex = "0"
            child.style.pointerEvents = 'none';
        });

        marker.element.addEventListener("mouseenter", (/** @type {MouseEvent} */ event) => {
            event.stopPropagation()
            marker.element.style.cursor = "pointer"
            
            pin.element.style.opacity = "0.9"
            pin.element.style.transform = "scale(1.2)";
            pin.element.style.transition = "all 0.2s ease-out";

            pin.background = hoverColor.back;
            pin.glyphColor = hoverColor.fore;
            pin.borderColor = hoverColor.accent;
            
            marker.element.style.zIndex = 1000
        });
        
        marker.element.addEventListener("mouseleave", (/** @type {MouseEvent} */ event) => {
            event.stopPropagation()
            marker.element.style.cursor = "auto"

            pin.element.style.opacity = "1"
            pin.element.style.transform = "scale(1)";

            pin.background = color.back;
            pin.borderColor = color.fore;
            pin.glyphColor = color.fore;

            setTimeout(() => {
                pin.element.style.transition = "none";
                marker.element.style.zIndex = 999
            }, 200)
        });

        return marker
    }

    /**
     * 
     * @param {Place} place1 
     * @param {Place} place2 
     * @param {google.maps.TravelMode} travelMode 
     * @returns {Promise<Distance?>}
     */
    async calculateDistance(place1, place2, travelMode = google.maps.TravelMode.DRIVING) {
        /** @type {google.maps.DistanceMatrixService} */
        // @ts-ignore
        const service = new this.distanceMatrixService()

        return new Promise((resolve, reject) => {
            try {
                service.getDistanceMatrix(
                    {
                        origins: [place1.getLatLng()],
                        destinations: [place2.getLatLng()],
                        travelMode: travelMode,
                        unitSystem: google.maps.UnitSystem.METRIC,
                    },
                    (response, status) => {
                        if (status === "OK" && response) {
                            const result = response.rows[0].elements[0];
                            if (result.status === "OK") {
                                resolve({
                                    distance: { text: result.distance.text, value: result.distance.value },
                                    duration: { text: result.duration.text, value: result.duration.value }
                                });
                            } else if (result.status == "ZERO_RESULTS") {
                                resolve(null);
                            }
                        }
                    }
                );
            } catch (error) {
                console.error(`Error calculating distance ${place1.name} ${place2.name}`)
                reject(error)
            }
        });
    }

    // async getBounding

    /**
     * 
     * @param {string} name 
     * @param {Place?} place 
     * @param {string} type 
     * @param {Promise<Place>} type 
     * @param {number} radius 
     * @returns {Promise<{name: string, adminArea1: string, adminArea2: string, lat: number, lng: number}[]>}
    */
    async getNearbyPlace(name, type = "", place = null, radius = 0) {
        /** @type {google.maps.places.PlacesService} */
        // @ts-ignore
        const service = new this.placesService(this.map)

        /** @type {google.maps.places.TextSearchRequest} */
        const query = { query: name }

        if (type) {
            query["type"] = type
        }

        if (radius) {
            query["radius"] = radius
        }

        if (place) {
            query["location"] = place.getLatLng()
        }

        return new Promise((resolve) => {
            service.textSearch(
                query,
                // @ts-ignore
                async (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        const searchResults = []

                        for (const place of results) {
                            const placeDetails = await this.#getPlaceDetails(place)
                            searchResults.push({"queryName": query.query, ...placeDetails})
                        }
                        resolve(searchResults);
                    } else {
                        resolve([]);
                    }
                }
            );
        });
    }

    /**
     * 
     * @param {google.maps.places.PlaceResult} placeResult 
     * @returns {Promise<{name: string, adminArea1: string, adminArea2: string, lat: number, lng: number}>}
     */
    async #getPlaceDetails(placeResult) {
        /** @type {google.maps.Geocoder} */
        // @ts-ignore
        const geocoder = new this.geocoder();
        return new Promise((resolve) => {
            geocoder.geocode({ location: placeResult.geometry?.location }, (results, status) => {
                if (status === "OK" && results && results.length > 0) {
                    let adminArea1 = "", adminArea2 = ""

                    results[0].address_components.forEach((component) => {
                        if (component.types.includes("administrative_area_level_1")) {
                            adminArea1 = component.long_name;
                        }
                        if (component.types.includes("administrative_area_level_2")) {
                            adminArea2 = component.long_name;
                        }
                    });

                    resolve({
                        name: placeResult.name || "",
                        adminArea1: adminArea1,
                        adminArea2: adminArea2,
                        lat: placeResult.geometry?.location?.lat() || 0,
                        lng: placeResult.geometry?.location?.lng() || 0,
                    });
                } else {
                    resolve(
                        {
                            name: "",
                            adminArea1: "",
                            adminArea2: "",
                            lat: 0,
                            lng: 0
                        }
                    );
                }
            });
        });
    }
}

// function getGeometryCenter(geometry) {
//     if (geometry.getType() === "Polygon") {
//         const bounds = new google.maps.LatLngBounds();
//         geometry.getArray().forEach((path) => {
//             path.getArray().forEach((latLng) => {
//                 bounds.extend(latLng);
//             });
//         });
//         return bounds.getCenter();
//     }
//     else if (geometry.getType() === "MultiPolygon") {
//         const bounds = new google.maps.LatLngBounds();
//         geometry.getArray().forEach((polygon) => {
//             polygon.getArray().forEach((path) => {
//                 path.getArray().forEach((latLng) => {
//                     bounds.extend(latLng);
//                 });
//             });
//         });
//         return bounds.getCenter();
//     }
//     return null;
// }