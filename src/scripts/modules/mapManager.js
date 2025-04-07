import Button from "./button.js"
import Map from "./map.js"
import Style from "./style.js"
import Tooltip, { HTMLEventAdapter, MapEventAdapter } from "./tooltip.js"
import Utils from "./utils.js"
import { Place, Hospital, Seller, Municipality, Locality } from "./classes.js"
import Files from "./files.js"

/**
 * @typedef {import('./types.js').Color} Color
 * @typedef {import('./types.js').PinColor} PinColor
 * @typedef {import('./types.js').MapEvent} MapEvent
 * @typedef {import('./types.js').MapFeature} MapFeature
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
        return `<span class="nowrap" style="display: inline-block; margin: 1px 1px; padding: 2px 3px; border-radius: 10px; background: ${color.back}; color: ${color.fore}; font-size: 0.6rem;">${tag}</span>`
    }

    /**
     * 
     * @param {Hospital} hospital 
     */
    async createHospitalMarker(hospital) {

        /** @type {Color} */
        const pinColor = { back: "#FFFFFF", fore: "#DC143C", accent: "#ad102f" }

        /** @type {Color} */
        const pinHoverColor = { back: "#DC143C", fore: "#FFFFFF", accent: "#DC143C" }

        /** @type {Color} */
        const nameColor = { back: "#FFFFFF", fore: "#DC143C", accent: "#ad102f" }

        /** @type {Color} */
        const infoColor = { back: "#DC143C", fore: "#FFFFFF", accent: "#ad102f" }

        /** @type {Color} */
        const selectionColor = { back: "#ffffff", fore: "#ad102f", accent: "" }

        /** @type {Color} */
        const scrollColor = { back: "transparent", fore: "#ad102f", accent: "" }

        /** @type {Color} */
        const coordsColor = { back: "#ad102f", fore: "#FFFFFF", accent: "#DC143C" }

        /** @type {Color[]} */
        const tagColors = [
            { back: "#E8627D", fore: "#FFFFFF", accent: "" },
            { back: "#EE8A9E", fore: "#FFFFFF", accent: "" },
            { back: "#F3B1BE", fore: "#000000", accent: "" },
            { back: "#F9D8DF", fore: "#000000", accent: "" },
        ]

        const faIcon = "fa-heart-pulse"

        const marker = await this.map.createMarker(hospital, "Hospital", faIcon, pinColor, pinHoverColor)

        if (marker.content instanceof HTMLElement) {

            const returnInHTML = (/** @type {HTMLElement} */ element) => `
                <div class="hospital" style="padding: 10px; border: 2px solid ${nameColor.accent}; border-radius: 5px; background-color: ${nameColor.back}; color: ${nameColor.fore};">
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
                    <div class="hospital" style="padding: 10px; border: 2px solid ${infoColor.accent}; border-radius: 5px; background-color: ${infoColor.back}; color: ${infoColor.fore};">
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
                                    <span class="coords-icon" style="position: relative; margin-left: 2px; color: ${infoColor.fore};">
                                        <i class="fa fa-location-dot"></i>
                                    </span>
                                </em>
                                <hr style="margin: 4px 0px 4px 0px; border-top: 1px solid ${infoColor.fore};"/>
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
                <button class="hospital" style="padding: 5px 10px; border: 2px solid ${coordsColor.accent}; border-radius: 5px; background-color: ${coordsColor.back}; color: ${coordsColor.fore}">
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
                    Tooltip.addCoordsTooltip(eventAdapter, coordsElement, returnCoordsHTML, setCopyFunction, (eventRect, tooltipRect) => [eventRect.x + eventRect.w + 5, eventRect.y + eventRect.h + 5])
                }
            }

            const element = marker.element

            Tooltip.addInTooltip(eventAdapter, element, returnInHTML, [], (eventRect, tooltipRect) => [eventRect.x + eventRect.w / 2, eventRect.y - eventRect.h - tooltipRect.h / 2])
            Tooltip.addOutTooltip(eventAdapter, element)
            Tooltip.addClickTooltip(eventAdapter, element, returnClickHTML, [() => Style.setSelectionColors(selectionColor), () => Style.setScrollbarColors(scrollColor), setVerticalSliderHeight, addCoordsTooltip], (elementRect, tooltipRect) => [elementRect.x + elementRect.w / 2, elementRect.y - elementRect.h - tooltipRect.h * 0.75])
        }
    }

    /**
     * 
     * @param {Seller} seller 
     * @param {Color} color 
     */
    async createSellerMarker(seller, color = { back: "#00BFFF", fore: "#FFFFFF", accent: "#0099cc", }) {

        /** @type {Color} */
        const pinColor = { back: color.accent2 || "", fore: color.fore, accent: color.fore }
        /** @type {Color} */

        const pinHoverColor = { back: color.accent, fore: color.fore, accent: color.fore }

        /** @type {Color} */
        const nameColor = { back: color.back, fore: color.fore, accent: color.accent }

        /** @type {Color} */
        const infoColor = nameColor

        /** @type {Color} */
        const coordsColor = { back: color.accent, fore: color.fore, accent: color.back }

        /** @type {Color} */
        const selectionColor = { back: color.accent, fore: color.fore, accent: "" }

        const faIcon = "fa-person-walking-luggage"

        const marker = await this.map.createMarker(seller, "Seller", faIcon, pinColor, pinHoverColor)

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
            <div class="seller" style="max-width: 300px; padding: 10px; border-radius: 5px; background-color: ${nameColor.back}; color: ${nameColor.fore};">
                <i class="fa ${faIcon}"></i> <span>${seller.name}</span>
            </div>
            `

            const returnClickHTML = (/** @type {HTMLElement} */ element) => `
                <div class="seller" style="min-width: 150px; max-width: 200px; padding: 10px; border-radius: 5px; background-color: ${infoColor.back}; color: ${infoColor.fore};">
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
                                <span class="coords-icon" style="position: relative; margin-left: 5px; padding-left: 5px; color: ${infoColor.fore}; text-align: right;">
                                    <i class="fa fa-location-dot fa-xl"></i>
                                </span>
                            </small>
                        </div>
                    </div>
                </div>
            `

            const returnCoordsHtml = (/** @type {HTMLElement} */ element) => `
                <button class="seller" style="padding: 5px 10px; border: 1px solid ${coordsColor.accent}; border-radius: 5px; background-color: ${coordsColor.back}; color: ${coordsColor.fore};">
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
                    Tooltip.addCoordsTooltip(eventAdapter, coordsElement, returnCoordsHtml, setCopyFunction, (eventRect, tooltipRect) => [eventRect.x + eventRect.w + 5, eventRect.y + eventRect.h + 5])
                }
            }

            const element = marker.element

            Tooltip.addInTooltip(eventAdapter, element, returnInHTML, [], (eventRect, tooltipRect) => [eventRect.x + eventRect.w / 2, eventRect.y - eventRect.h - 5])
            Tooltip.addOutTooltip(eventAdapter, element)
            Tooltip.addClickTooltip(eventAdapter, element, returnClickHTML, [() => Style.setSelectionColors(selectionColor), addCoordsTooltip], (elementRect, tooltipRect) => [elementRect.x + elementRect.w / 2, elementRect.y - elementRect.h - tooltipRect.h / 2])
        }
    }

    async setFeatureEvents() {

        const eventAdapter = new MapEventAdapter()

        const returnInHTML = (/** @type {MapFeature} */ feature) => {
            const name = feature.getProperty("name")
            return `
                <span>${name}</span>
            `
        }

        const showHover = (/** @type {MapEvent} */ event) => {
            this.map.map.data.overrideStyle(event.feature, {
                fillColor: '#ff0000',
                strokeColor: '#ff0000'
            });
        }

        const hideHover = (/** @type {MapEvent} */ event) => {
            this.map.map.data.revertStyle(event.feature);
        }

        Tooltip.addInTooltip(eventAdapter, this.map.map.data, returnInHTML, showHover, (eventRect, tooltipRect) => [eventRect.x, eventRect.y])
        Tooltip.addOutTooltip(eventAdapter, this.map.map.data, hideHover)
    }


    /**
     *
     * @param {Object<string, Place>} places1Dict
     * @param {Object<string, Place>} places2Dict
     * @param {google.maps.TravelMode} travelMode
     * @param {[string, string]} placesKeys
     * @param {Boolean} test
     */
    async calculatePlacesDistances(places1Dict, places2Dict, travelMode = google.maps.TravelMode.DRIVING, placesKeys = ["", ""], test = false) {
        let key1 = placesKeys[0] ? placesKeys[0] : Object.values(places1Dict).length ? Object.values(places1Dict)[0].constructor.name.toLowerCase() : "place"
        let key2 = placesKeys[1] ? placesKeys[1] : Object.values(places2Dict).length ? Object.values(places2Dict)[0].constructor.name.toLowerCase() : "place"

        const fileName = `distances${travelMode.charAt(0) + travelMode.slice(1).toLowerCase()}${key1.charAt(0).toUpperCase() + key1.slice(1)}To${key2.charAt(0).toUpperCase() + key2.slice(1)}`;

        if (key1 == key2) {
            key1 = key1 + "1"
            key2 = key2 + "2"
        }

        const a = document.createElement("a");

        let placeIds1 = Object.keys(places1Dict);
        let placeIds2 = Object.keys(places2Dict);

        if (test) {
            placeIds1 = placeIds1.slice(0, 2);
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
                    Files.saveJSONL(lines, fileName, a);
                    lines = [];
                }
            }
        }

        if (lines.length) {
            Files.saveJSONL(lines, fileName, a);
        }
    }

    /**
     * @param {Object<string, Municipality | Locality>} areasDict
     */
    async createFeatureTooltips(areasDict) {

        /** @type {Color} */
        const nameColors = { back: "#F0F8FF", fore: "#061647", accent: "#EDF6FC" }

        /** @type {Color} */
        const infoColor = { back: "#F0F8FF", fore: "#061647", accent: "#EDF6FC" }

        /** @type {Color} */
        const selectionColors = { back: "#061647", fore: "#F5F5F5", accent: "" }

        const faIcon = "fa-map"

        const numberFormat = new Intl.NumberFormat("es-CO", {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
            style: "decimal"
        });

        const returnInHTML = (/** @type {MapFeature} */ feature) => {
            const name = feature.getProperty('name');
            const type = feature.getProperty('type');

            if (typeof name == "string" && typeof type == "string"){
                let localityName = ""
                let municipalityName = ""
                let departmentName = ""
    
                switch (type) {
                    case "DEPARTMENT":
                        departmentName = name
                        break
                    case "MUNICIPALITY":
                        const departmentId = typeof feature.getProperty('departmentId') == "string" ? feature.getProperty('departmentId') : ""
                        const department = areasDict
                        break
                    case "LOCALITY":
    
                        break
                }
    
                return `
                    <div class="feature" style="padding: 5px; border: 1px solid ${nameColors.fore}; border-radius: 5px; background-color: ${nameColors.back}; color: ${nameColors.fore};">
                        <i class="fa ${faIcon}"></i>
                        <span>${name}</span>
                    </div>
                `
            } else {
                return ""
            }

        }

        const returnClickHTML = (/** @type {google.maps.Data.Feature} */ feature) => {
            const name = feature.getProperty('name');

            const area = feature.getProperty('area');
            const population2025 = feature.getProperty('population2025');
            const density2025 = feature.getProperty('density2025');
            const population2035 = feature.getProperty('population2035');
            const density2035 = feature.getProperty('density2035');

            if (typeof area == "number" && typeof population2025 == "number" && typeof population2035 == "number" && typeof density2025 == "number" && typeof density2035 == "number") {
                return `
                    <div class="area feature-card" style="max-width: 225px; padding: 10px; border: 1px solid ${infoColor.fore}; border-radius: 5px; background-color: ${infoColor.back}; color: ${infoColor.fore}; transition: all 0.3s ease;">
                        <div class="card-header" style="display: inline-block; align-items: center;">
                            <span style="margin: 0; align-items: center;"> 
                                <i class="fa ${faIcon}" style="color: ${infoColor.fore};"></i>
                                <b>${name}</b>
                                <b>${name}</b>
                            </span>
                            <lrg style="white-space: nowrap;">[${numberFormat.format(area)} km<sup>2</sup>]</lrg>
                        </div>
                        <hr style="margin: 10px 0px 2px 0px; border-top: 1px solid ${infoColor.fore};"/>
                        <div class="statistics-table-container" style="padding: 4px; border-radius: 6px;"> 
                            <table style="width: 100%; border-collapse: collapse;"> 
                                <thead>
                                    <tr>
                                        <th style ="padding: 1px; text-align: left; border-bottom: 2px solid ${infoColor.back}40;"></th>
                                        <th style ="padding: 1px; text-align: right; border-bottom: 2px solid ${infoColor.back}40; border-left: 2px solid ${infoColor.back}40; background: ${infoColor.accent}; color: ${infoColor.fore};">
                                            <med>
                                                <strong>2025</strong>
                                            </med>
                                        </th>
                                        <th style ="padding: 1px; text-align: right; border-bottom: 2px solid ${infoColor.back}40; border-left: 2px solid ${infoColor.back}40; background: ${infoColor.accent}; color: ${infoColor.fore};">
                                            <med>
                                                <strong>2035</strong>
                                            </med>    
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="padding: 1px; text-align: center; border-bottom: 2px solid ${infoColor.back}40; border-left: 2px solid ${infoColor.back}40; background: ${infoColor.accent};">
                                            <med>
                                                <b>Población</b>
                                            </med>
                                        </td>
                                        <td style="padding: 1px; text-align: right; border-left: 2px solid ${infoColor.back}40; background: ${infoColor.accent};">
                                            <med>
                                                ${numberFormat.format(population2025)}
                                            </med>       
                                        </td>
                                        <td style="padding: 1px; text-align: right; border-left: 2px solid ${infoColor.back}40; background: ${infoColor.accent};">
                                            <med>
                                                ${numberFormat.format(population2035)}
                                            </med>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 1px; text-align: center; border-top: 2px solid ${infoColor.back}40; border-left: 2px solid ${infoColor.back}40; background: ${infoColor.accent};">
                                            <med>
                                                <b>Densidad</b>
                                            </med>    
                                        </td>
                                        <td style="padding: 1px; text-align: right; border-top: 2px solid ${infoColor.back}40; border-left: 2px solid ${infoColor.back}40; background: ${infoColor.accent};">
                                            <med>
                                                ${density2025.toFixed(2)}
                                            </med>    
                                        </td>
                                        <td style="padding: 1px; text-align: right; border-left: 2px solid ${infoColor.back}40; border-top: 2px solid ${infoColor.back}40; background: ${infoColor.accent};">
                                            <med>
                                                ${density2035.toFixed(2)}
                                            </med>    
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } else {
                return ""
            }

        }

        const eventAdapter = new MapEventAdapter()

        const showHover = (/** @type {MapEvent} */ event) => {
            const feature = event.feature

            const hoverColor = feature.getProperty("hoverColor");

            if (typeof hoverColor == "string") {
                this.map.map.data.overrideStyle(event.feature, {
                    fillColor: hoverColor,
                    strokeColor: "#ffffff"
                });
            }

            event.domEvent.stopPropagation();
        }

        const hideHover = (/** @type {MapEvent} */ event) => {
            this.map.map.data.revertStyle(event.feature);
        }

        Tooltip.addInTooltip(eventAdapter, this.map.map.data, returnInHTML, showHover, (targetRect, tooltipRect) => [targetRect.x, targetRect.y + 5])
        Tooltip.addOutTooltip(eventAdapter, this.map.map.data, hideHover)
        Tooltip.addClickTooltip(eventAdapter, this.map.map.data, returnClickHTML, showHover, (targetRect, tooltipRect) => [targetRect.x, targetRect.y])
    }
}