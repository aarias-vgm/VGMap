import { Area } from "../models/area.js"

/**
 * 
 * @param {{[id: string]: Area}} municipalitiesDict
 * @returns {{[id: string]: Area}} 
 */
export function createAreasDict(municipalitiesDict) {
    /** @type {{[id: string]: Area}} */
    const places = {}

    for (const municipality of Object.values(municipalitiesDict)) {
        if (municipality.subareas.length) {
            for (const locality of Object.values(municipality.subareas)) {
                places[locality.id] = locality
            }
        } else {
            places[municipality.id] = municipality
        }
    }

    return places
}