import { Area } from "../models/area.js";
import { Hospital } from "../models/hospital.js"
import Files from "../utils/files.js"
import { areasDict } from "./data.js";

/**
 * 
 * @param {{[id: string]: Area}} areasDict 
 * @returns {Promise<{[id: string]: Hospital}>}
 */
export async function loadHospitalsDict(areasDict) {
    const lines = (await Files.loadTextFile("psv/hospitals.psv")).split("\n");

    const cols = Files.getColsNames(lines[0].split("|"));

    /** @type {{[id: string]: Hospital}} */
    const hospitalsDict = {};

    for (let row = 1; row < lines.length; row++) {
        const line = lines[row].split("|");

        const hospital = new Hospital(
            line[cols["id"]],
            line[cols["name"]],
            line[cols["nit"]],
            Number(line[cols["complexity"]]),
            line[cols["services"]],
            line[cols["accreditationCode"]],
            Number(line[cols["lat"]]),
            Number(line[cols["lng"]])
        );

        const area = areasDict[line[cols["localityId"]]] || areasDict[line[cols["municipalityId"]]];

        if (area) {
            hospital.area = area;
            area.hospitals.push(hospital);
        }

        if (!hospital.area) {
            console.error(`Area ID ${line[cols["areaId"]]} not found: Municipality ID ${line[cols["municipalityId"]]}, Locality ID ${areasDict[line[cols["localityId"]]]}`);
        }

        hospitalsDict[hospital.id] = hospital;
    }

    return hospitalsDict;
}