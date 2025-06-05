import { Area } from "../models/area.js"
import Files from "../utils/files.js"

/**
 * 
 * @param {{[id: string]: Area}} departmentsDict 
 * @returns {Promise<{[id: string]: Area}>}
 */
export async function loadMunicipalitiesDict(departmentsDict) {
    const lines = (await Files.loadTextFile("psv/municipalities.psv")).split("\n")

    const cols = Files.getColsNames(lines[0].split("|"))

    /** @type {{[id: string]: Area}} */
    const municipalitiesDict = {}

    for (let row = 1; row < lines.length; row++) {
        const line = lines[row].split("|")

        const municipality = new Area(
            line[cols["id"]],
            line[cols["name"]],
            // @ts-ignore
            line[cols["type"]],
            Number(line[cols["lat"]]),
            Number(line[cols["lng"]])
        )

        municipality.population = Number(line[cols["population2025"]])
        municipality.estimatedPopulation = Number(line[cols["population2035"]])
        municipality.density = Number(line[cols["density2025"]])
        municipality.estimatedDensity = Number(line[cols["density2035"]])

        let department = departmentsDict[line[cols["departmentId"]]]

        if (department) {
            municipality.parentArea = department
            department.subareas.push(municipality)
        } else {
            console.error(`Department ID ${line[cols["departmentId"]]} not found: Municipality ID ${municipality.id}`)
        }

        municipalitiesDict[municipality.id] = municipality
    }

    return municipalitiesDict
}