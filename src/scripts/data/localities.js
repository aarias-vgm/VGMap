import { Area } from "../models/area.js"
import Files from "../utils/files.js"

/**
 * 
 * @param {{[id: string]: Area}} municipalitiesDict 
 * @returns {Promise<{[id: string]: Area}>}
 */
export async function loadLocalitiesDict(municipalitiesDict) {
    const lines = (await Files.loadTextFile("psv/localities.psv")).split("\n")

    const cols = Files.getColsNames(lines[0].split("|"))

    /** @type {{[id: string]: Area}} */
    const localitiesDict = {}

    for (let row = 1; row < lines.length; row++) {
        const line = lines[row].split("|")

        const locality = new Area(
            line[cols["id"]],
            line[cols["name"]],
            'localidad',
            Number(line[cols["lat"]]),
            Number(line[cols["lng"]])
        )

        locality.population = Number(line[cols["population2025"]])
        locality.estimatedPopulation = Number(line[cols["population2035"]])
        locality.density = Number(line[cols["density2025"]])
        locality.estimatedDensity = Number(line[cols["density2035"]])

        let municipality = municipalitiesDict[line[cols["municipalityId"]]]

        if (municipality) {
            locality.parentArea = municipality
            municipality.subareas.push(locality)
        } else {
            console.error(`Municipality ID ${line[cols["municipalityId"]]} not found: Locality ID ${locality.id}`)
        }

        localitiesDict[locality.id] = locality
    }

    return localitiesDict
}