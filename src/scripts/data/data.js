import { Area } from "../models/area.js";
import { Hospital } from "../models/hospital.js";
import { Place } from "../models/place.js";
import { Seller } from "../models/seller.js";
import { createAreasDict } from "./areas.js";
import { loadDepartmentsDict } from "./departments.js";
import { loadHospitalsDict } from "./hospitals.js";
import { loadLocalitiesDict } from "./localities.js";
import { loadMunicipalitiesDict } from "./municipalities.js";
import { loadSellersDict } from "./sellers.js";

/** @type {{[id: string]: Area}} */
export let departmentsDict = Object.create(null);

/** @type {{[id: string]: Area}} */
export let municipalitiesDict = Object.create(null);

/** @type {{[id: string]: Area}} */
export let localitiesDict = Object.create(null);

/** @type {{[id: string]: Area}} */
export let areasDict = Object.create(null);

/** @type {{[id: string]: Hospital}} */
export let hospitalsDict = Object.create(null);

/** @type {{[id: string]: Seller}} */
export let sellersDict = Object.create(null);

/** @type {{[id: string]: Place}} */
export let placesDict = Object.create(null)

async function loadData() {
    departmentsDict = await loadDepartmentsDict();
    municipalitiesDict = await loadMunicipalitiesDict(departmentsDict);
    localitiesDict = await loadLocalitiesDict(municipalitiesDict);
    areasDict = createAreasDict(municipalitiesDict);
    hospitalsDict = await loadHospitalsDict(areasDict);
    sellersDict = await loadSellersDict(areasDict);
    placesDict = { ...departmentsDict, ...municipalitiesDict, ...localitiesDict }
}

const Data = {
    loadData: loadData,
}

export default Data