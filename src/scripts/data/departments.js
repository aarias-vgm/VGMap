import { Area } from "../models/area.js"
import Files from "../utils/files.js"

/**
 * 
 * @returns {Promise<{[id: string]: Area}>}
 */
export async function loadDepartmentsDict() {
    const lines = (await Files.loadTextFile("psv/departments.psv")).split("\n")

    const cols = Files.getColsNames(lines[0].split("|"))

    /** @type {{[id: string]: Area}} */
    const departmentsDict = {}

    for (let row = 1; row < lines.length; row++) {
        const line = lines[row].split("|")

        const department = new Area(
            line[cols["id"]],
            line[cols["name"]],
            'departamento',
            Number(line[cols["lat"]]),
            Number(line[cols["lng"]])
        )

        department.population = Number(line[cols["population2025"]])
        department.estimatedPopulation = Number(line[cols["population2035"]])
        department.density = Number(line[cols["density2025"]])
        department.estimatedDensity = Number(line[cols["density2035"]])

        departmentsDict[department.id] = department
    }

    return departmentsDict
}