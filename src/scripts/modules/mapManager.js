import Button from "./button.js"
import Map from "./map.js"
import Style from "./style.js"
import Tooltip, { HTMLEventAdapter, MapEventAdapter } from "./tooltip.js"
import Utils from "./utils.js"
import { Place, Hospital, Seller, Municipality } from "./classes.js"
import Files from "./files.js"

/**
 * @typedef {import('./types.js').Color} Color
 * @typedef {import('./types.js').PinColor} PinColor
 * @typedef {import('./types.js').MapEvent} MapEvent
 * @typedef {import('./types.js').MapFeature} MapFeature
 * @typedef {import('./types.js').Rect} Rect
 */

export default class MapManager {

    /** @type {Map} */
    map

    constructor() {
        this.map = new Map()
    }

    /**
     * 
     * @param {string} path 
     * @returns {Promise<google.maps.Data.Feature[]>}
     */
    async addGeoJSON(path) {
        return this.map.map.data.addGeoJson(await Files.loadJSONFile(path))
    }

    /**
     * 
     * @param {string} tag 
     * @param {Color} color
     * @returns {string}
     */
    createTagHTML(tag, color) {
        return `<span class="nowrap" style="display: inline-block; margin: 1px 1px; padding: 2px 3px; border-radius: 10px; background: ${color.back}; color: ${color.font}; font-size: 0.6rem;">${tag}</span>`
    }

    /**
     * 
     * @param {Hospital} hospital 
     */
    async createHospitalMarker(hospital) {

        /** @type {PinColor} */
        const pinColors = { background: "#FFFFFF", border: "#DC143C", "glyph": "#DC143C", hoverBackground: "#F5F5F5", hoverBorder: "#c51236", hoverGlyph: "#c51236" }

        /** @type {Color} */
        const nameColors = { back: "#FFFFFF", font: "#DC143C", border: "#DC143C" }

        /** @type {Color} */
        const infoColors = { back: "#DC143C", font: "#FFFFFF", border: "#DC143C" }

        /** @type {Color} */
        const selectionColors = { back: "#ffffff", font: "#ad102f" }

        /** @type {Color} */
        const scrollColors = { back: "transparent", fore: "#ad102f" }

        /** @type {Color} */
        const coordsColors = { back: "#ad102f", font: "#FFFFFF", border: "#ad102f" }

        /** @type {Color[]} */
        const tagColors = [
            { back: "#E8627D", font: "#FFFFFF" },
            { back: "#EE8A9E", font: "#FFFFFF" },
            { back: "#F3B1BE", font: "#000000" },
            { back: "#F9D8DF", font: "#000000" },
        ]

        const faIcon = "fa-heart-pulse"

        const marker = await this.map.createMarker(hospital, "Hospital", faIcon, pinColors)

        if (marker.content instanceof HTMLElement) {

            const returnInHTML = (/** @type {HTMLElement} */ element) => `
                <div class="hospital" style="padding: 10px; border: 2px solid ${nameColors.border}; border-radius: 5px; background-color: ${nameColors.back}; color: ${nameColors.font};">
                    <i class="fa ${faIcon}"></i>
                    <span>${hospital.name}</span>
                </div>
            `

            const returnClickHTML = (/** @type {HTMLElement} */ element) => {
                let index = Utils.getRandomNumber(tagColors.length);

                let municipality = undefined
                let locality = undefined

                if (hospital.area) {
                    if (hospital.area instanceof Municipality) {
                        municipality = hospital.area
                    } else {
                        locality = hospital.area
                        municipality = locality.municipality
                    }
                }

                return `
                    <div class="hospital" style="padding: 10px; border: 2px solid ${infoColors.border}; border-radius: 5px; background-color: ${infoColors.back}; color: ${infoColors.font};">
                        <div style="display: flex; flex-direction: row; justify-content: left; align-items: start;">
                            <div class="left" style="max-width: 125px; height: min-content;">
                                <h5 style="margin-bottom: 4px;">
                                    <span style="display: inline-flex; white-space: nowrap;">
                                        <i class="fa ${faIcon}" style="margin-right: 3px;"></i>
                                        <span>${hospital.name.split(" ")[0]}</span>
                                    </span>
                                    <span>${hospital.name.split(" ").slice(1).join(" ")}</span>
                                </h5>
                                <em style="font-size: 0.75rem;">
                                    <span>${municipality?.name}</span>${locality ? '<span> | ' + locality.name + '</span>' : ''}
                                    <span>(${municipality?.department?.name})</span>
                                    <span class="coords-icon" style="position: relative; margin-left: 2px; color: ${infoColors.font};">
                                        <i class="fa fa-location-dot"></i>
                                    </span>
                                </em>
                                <hr style="margin: 4px 0px 4px 0px; border-top: 1px solid ${infoColors.font};"/>
                                <small class="nowrap">
                                    <b>ID:</b>
                                    <span>${hospital.id}</span>
                                    <br>
                                    <b>Complejidad:</b>
                                    <span>${hospital.complexity}</span>
                                </small>
                            </div>
                            <div class="right vertical-slider" style="width: min-content; margin-left: 10px; padding-right: 5px; flex-shrink: 0;">
                                <small>
                                    ${hospital.services.split(",").map(service => { index++; return this.createTagHTML(service.trim(), tagColors[index % tagColors.length]) }).join("")}                               
                                </small>    
                            </div>
                        </div>
                    </div>
                `
            }

            const returnCoordsHTML = (/** @type {HTMLElement} */ element) => `
                <button class="hospital" style="padding: 5px 10px; border: 2px solid ${coordsColors.border}; border-radius: 5px; background-color: ${coordsColors.back}; color: ${coordsColors.font}">
                    <code style="text-align: left;">
                        <small>
                            <p>
                                <b>Lat:</b>
                                <span>${hospital.lat}</span>
                            </p>
                            <p>
                                <b>Lng:</b>
                                <span>${hospital.lng}</span>
                            </p>
                        </small>
                    </code>
                </button>
            `
            const eventAdapter = new HTMLEventAdapter()

            const setVerticalSliderHeight = () => {
                const left = Tooltip.clickTooltip.querySelector(".left")
                if (left instanceof HTMLElement) {
                    const verticalSlider = Tooltip.clickTooltip.querySelector(".vertical-slider")
                    if (verticalSlider instanceof HTMLElement) {
                        verticalSlider.style.height = `${left.offsetHeight}px`
                    }
                }
            }

            const addCoordsTooltip = () => {
                const coordsElement = Tooltip.clickTooltip.querySelector(".coords-icon")
                if (coordsElement instanceof HTMLElement) {
                    const setCopyFunction = () => {
                        const button = Tooltip.coordsTooltip.getElementsByTagName("button")[0]
                        button.onclick = () => Button.copyText(button, `${hospital.lat}, ${hospital.lng}`)
                    }
                    Tooltip.addCoordsTooltip(eventAdapter, coordsElement, returnCoordsHTML, setCopyFunction, (eventRect, tooltipRect) => [eventRect.x, eventRect.y])
                }
            }

            const element = marker.element

            Tooltip.addInTooltip(eventAdapter, element, returnInHTML, [], (eventRect, tooltipRect) => [eventRect.x + eventRect.w / 2, eventRect.y - eventRect.h - tooltipRect.h / 2])
            Tooltip.addOutTooltip(eventAdapter, element)
            Tooltip.addClickTooltip(eventAdapter, element, returnClickHTML, [() => Style.setSelectionColors(selectionColors), () => Style.setScrollbarColors(scrollColors), setVerticalSliderHeight, addCoordsTooltip], (elementRect, tooltipRect) => [elementRect.x + elementRect.w / 2, elementRect.y - elementRect.h - tooltipRect.h * 0.75])
        }
    }

    /**
     * 
     * @param {Seller} seller 
     */
    async createSellerMarker(seller) {

        /** @type {PinColor} */
        const pinColors = { background: "#00BFFF", border: "#00BFFF", "glyph": "#FFFFFF", hoverBackground: "#00ace6", hoverBorder: "#00ace6", hoverGlyph: "#FFFFFF" }

        /** @type {Color} */
        const nameColors = { back: "#00BFFF", font: "#FFFFFF", border: "#00BFFF" }

        /** @type {Color} */
        const infoColors = nameColors

        /** @type {Color} */
        const coordsColors = { back: "#0099cc", font: "#FFFFFF", border: "#0099cc" }

        /** @type {Color} */
        const selectionColors = { back: "#ffffff", font: "#0099cc" }

        const faIcon = "fa-person-walking-luggage"

        const marker = await this.map.createMarker(seller, "Seller", faIcon, pinColors)

        if (marker.content instanceof HTMLElement) {

            let municipality = undefined
            let locality = undefined

            if (seller.area) {
                if (seller.area instanceof Municipality) {
                    municipality = seller.area
                } else {
                    locality = seller.area
                    municipality = locality.municipality
                }
            }

            const returnInHTML = (/** @type {HTMLElement} */ element) => `
            <div class="seller" style="max-width: 300px; padding: 10px; border: 2px solid ${nameColors.border}; border-radius: 5px; background-color: ${nameColors.back}; color: ${nameColors.font};">
                <i class="fa ${faIcon}"></i> <span>${seller.name}</span>
            </div>
            `

            const returnClickHTML = (/** @type {HTMLElement} */ element) => `
                <div class="seller" style="min-width: 150px; max-width: 300px; padding: 10px; border: 2px solid ${infoColors.border}; border-radius: 5px; background-color: ${infoColors.back}; color: ${infoColors.font};">
                    <div style="display: flex; flex-direction: row; justify-content: left; align-items: center;">
                        <div>
                            <h3 style="margin-bottom: 5px;">
                                <i class="fa ${faIcon}"></i>
                                <span>${seller.name}</span>
                            </h3>
                            <p style="margin-top: 3px;">${seller.address}</p>
                            <small style="display: flex; position: relative;">
                                <em>
                                    <span>${municipality?.name}</span>${locality ? '<span> | ' + locality.name + '</span>' : ''}
                                    <span>(${municipality?.department?.name})</span>
                                </em>
                                <span style="position: relative; flex-grow: 1;"></span>
                                <span class="coords-icon" style="position: relative; margin-left: 5px; padding-left: 5px; color: ${infoColors.font}; text-align: right;">
                                    <i class="fa fa-location-dot fa-xl"></i>
                                </span>
                            </small>
                        </div>
                    </div>
                </div>
            `

            const returnCoordsHtml = (/** @type {HTMLElement} */ element) => `
                <button class="seller" style="padding: 5px 10px; border: 2px solid ${coordsColors.border}; border-radius: 5px; background-color: ${coordsColors.back}; color: ${coordsColors.font}">
                    <code style="text-align: left;">
                        <small>
                            <p>
                                <b>Lat:</b>
                                <span>${seller.lat}</span>
                            </p>
                            <p>
                                <b>Lng:</b>
                                <span>${seller.lng}</span>
                            </p>
                        </small>
                    </code>
                </button>
            `

            const eventAdapter = new HTMLEventAdapter()

            const addCoordsTooltip = () => {
                const coordsElement = Tooltip.clickTooltip.querySelector(".coords-icon")
                if (coordsElement instanceof HTMLElement) {
                    const setCopyFunction = () => {
                        const button = Tooltip.coordsTooltip.getElementsByTagName("button")[0]
                        button.onclick = () => Button.copyText(button, `${seller.lat}, ${seller.lng}`)
                    }
                    Tooltip.addCoordsTooltip(eventAdapter, coordsElement, returnCoordsHtml, setCopyFunction, (eventRect, tooltipRect) => [eventRect.x + eventRect.w, eventRect.y + eventRect.h])
                }
            }

            const element = marker.element

            Tooltip.addInTooltip(eventAdapter, element, returnInHTML, [], (eventRect, tooltipRect) => [eventRect.x + eventRect.w / 2, eventRect.y - eventRect.h - 5])
            Tooltip.addOutTooltip(eventAdapter, element)
            Tooltip.addClickTooltip(eventAdapter, element, returnClickHTML, [() => Style.setSelectionColors(selectionColors), addCoordsTooltip], (elementRect, tooltipRect) => [elementRect.x + elementRect.w / 2, elementRect.y - elementRect.h - tooltipRect.h / 2])
        }
    }

    async createFeatureTooltips(){

        /** @type {PinColor} */
        const pinColors = { background: "#FFFFFF", border: "#DC143C", "glyph": "#DC143C", hoverBackground: "#F5F5F5", hoverBorder: "#c51236", hoverGlyph: "#c51236" }

        /** @type {Color} */
        const nameColors = { back: "#FFFFFF", font: "#DC143C", border: "#DC143C" }

        /** @type {Color} */
        const infoColors = { back: "#DC143C", font: "#FFFFFF", border: "#DC143C" }

        /** @type {Color} */
        const selectionColors = { back: "#ffffff", font: "#ad102f" }

        /** @type {Color} */
        const scrollColors = { back: "transparent", fore: "#ad102f" }

        /** @type {Color[]} */
        const tagColors = [
            { back: "#E8627D", font: "#FFFFFF" },
            { back: "#EE8A9E", font: "#FFFFFF" },
            { back: "#F3B1BE", font: "#000000" },
            { back: "#F9D8DF", font: "#000000" },
        ]

        const faIcon = "fa-map"

        const returnInHTML = (/** @type {MapFeature} */ feature) => {
            const name = feature.getProperty('name');
    
            return `
            <div class="feature" style="padding: 5px; border: 2px solid ${nameColors.border}; border-radius: 5px; background-color: ${nameColors.back}; color: ${nameColors.font};">
            <i class="fa ${faIcon}"></i>
                <span>${name}</span>
            </div>
            `
        }
        let index = Utils.getRandomNumber(tagColors.length);

        const returnClickHTMLL = (/** @type {google.maps.Data.Feature} */ feature) => {

            const name = feature.getProperty('name');
            const area = feature.getProperty('area');
            const population2025 = feature.getProperty('population2025');
            const density2025 = feature.getProperty('density2025');
            const population2035 = feature.getProperty('population2035');
            const density2035 = feature.getProperty('density2035');
    
            return `
            <div class="feature" style="padding: 10px; border: 2px solid ${infoColors.border}; border-radius: 5px; background-color: ${infoColors.back}; color: ${infoColors.font};">
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                    <h5 style="margin-bottom: 8px;">
                        <i class="fa ${faIcon}" style="margin-right: 5px;"></i>
                        <span>Nombre:${name}</span>

                        <span>Area:${area}</span>
                    </h5>
                    <div style="margin-bottom: 4px;">
                        <strong>Population 2025:</strong> <span>${population2025}</span><br>
                        <strong>Density 2025:</strong> <span>${density2025}</span>
                    </div>
                    <div>
                        <strong>Population 2035:</strong> <span>${population2035}</span><br>
                        <strong>Density 2035:</strong> <span>${density2035}</span>
                    </div>
                </div>
            </div>
            `;
        }


        const eventAdapter = new MapEventAdapter()

        const showHover = (/** @type {MapEvent} */ event) => {
            this.map.map.data.overrideStyle(event.feature, {
                fillColor: '#ff0000',
                strokeColor: '#ff0000'
              });
        }

        const hideHover = (/** @type {MapEvent} */ event) => {
            this.map.map.data.revertStyle(event.feature);
        }

        
        

        Tooltip.addInTooltip(eventAdapter, this.map.map.data, returnInHTML, showHover, (eventRect, tooltipRect) => [eventRect.x, eventRect.y+5])
        Tooltip.addOutTooltip(eventAdapter, this.map.map.data, hideHover)
        Tooltip.addClickTooltip(eventAdapter, this.map.map.data, returnClickHTMLL, showHover, (/** @type {Rect} */ targetRect, /** @type {Rect} */ tooltipRect) => [targetRect.x,targetRect.y])

    }


    /**
     * Calcula distancias para cada par (place1, place2) evitando duplicados
     * si se trata del mismo diccionario. Genera uno o más NDJSON.
     *
     * @param {Object<string, Place>} places1Dict
     * @param {Object<string, Place>} places2Dict
     * @param {google.maps.TravelMode} travelMode
     * @param {Boolean} className
     * @param {Boolean} test
     */
    async calculatePlacesDistances(places1Dict, places2Dict, travelMode = google.maps.TravelMode.DRIVING, className = false, test = false) {
        let key1 = className ? Object.values(places1Dict).length > 0 ? Object.values(places1Dict)[0].constructor.name.toLowerCase() : "place1" : "place1";
        let key2 = className ? Object.values(places2Dict).length > 0 ? Object.values(places2Dict)[0].constructor.name.toLowerCase() : "place2" : "place2";

        const fileName = `distances${travelMode.charAt(0) + travelMode.slice(1).toLowerCase()}${key1.charAt(0).toUpperCase() + key1.slice(1)}To${key2.charAt(0).toUpperCase() + key2.slice(1)}`;

        key1 = key1 + "1"
        key2 = key2 + "2"

        const a = document.createElement("a");

        let placeIds1 = Object.keys(places1Dict);
        let placeIds2 = Object.keys(places2Dict);

        if (test) {
            placeIds1 = placeIds1.slice(0, 1);
            placeIds2 = placeIds2.slice(0, 2);
        }

        const isSameDict = places1Dict === places2Dict;

        let maxCount
        /** @type {(i: number) => number} */
        let getIndex

        if (isSameDict) {
            maxCount = Math.round((placeIds1.length * (placeIds2.length - 1)) / 2); // número de pares sin repetición
            getIndex = (i) => i + 1 // combination
        } else {
            maxCount = placeIds1.length * placeIds2.length;
            getIndex = (i) => 0 // permutation
        }

        let lines = [];
        let counter = 0;

        for (let i = 0; i < placeIds1.length; i++) {
            const place1Id = placeIds1[i];
            const place1 = places1Dict[place1Id];

            for (let j = getIndex(i); j < placeIds2.length; j++) {
                counter++;

                const place2Id = placeIds2[j];
                const place2 = places2Dict[place2Id];

                console.log(`${place1Id} -> ${place2Id} | ${counter} of ${maxCount} [${(counter / (maxCount / 100)).toFixed(2)}%]`);

                const distance = await this.map.calculateDistance(place1, place2, travelMode);
                if (distance) {
                    const object = { [key1]: place1Id, [key2]: place2Id, travelMode: travelMode, ...distance, };
                    lines.push(object);
                }

                if (lines.length > 999) {
                    Files.saveNDJSON(lines, fileName, a);
                    lines = [];
                }
            }
        }

        if (lines.length > 0) {
            Files.saveNDJSON(lines, fileName, a);
        }
    }

}