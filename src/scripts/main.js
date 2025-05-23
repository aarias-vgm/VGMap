import { Department, Municipality, Hospital, Seller, Locality } from "./modules/classes.js"
import MapManager from "./modules/mapManager.js"
import Files from "./modules/files.js"

/**
 * @typedef {import('./modules/types.js').Color} Color
 * @typedef {import('./modules/types.js').MapEvent} MapEvent
 * @typedef {import('./modules/types.js').MapFeature} MapFeature
 * @typedef {import('./modules/types.js').DistanceLine} DistanceLine
 */

async function run() {

    const departmentsDict = await loadDepartmentsDict()

    const municipalitiesDict = await loadMunicipalitiesDict(departmentsDict)

    const localitiesDict = await loadLocalitiesDict(municipalitiesDict)

    const areasDict = createAreasDict(municipalitiesDict)

    const hospitalsDict = await loadHospitalsDict(municipalitiesDict, localitiesDict)

    const sellersDict = await loadSellersDict(areasDict)

    const excludedDepartments = [
        "85", // Casanare
        "88", // San Andrés
        "91", // Amazonas
        "94", // Guainía
        "99", // Vichada
    ]

    const mapManager = new MapManager()
    await mapManager.map.runAPI()

    await mapManager.map.importPinElement()
    await mapManager.map.importAdvancedMarkerElement()

    await mapManager.map.importDistanceService()
    await mapManager.map.importGeocoderService()

    // await mapManager.calculatePlacesDistances(departmentsDict, departmentsDict, google.maps.TravelMode.DRIVING, true)
    //await mapManager.calculatePlacesDistances(hospitalsDict, sellersDict, google.maps.TravelMode.DRIVING, true)
    // await mapManager.calculatePlacesDistances(hospitalsDict, areasDict, google.maps.TravelMode.DRIVING, false)
    // await mapManager.calculatePlacesDistances(hospitalsDict, localitiesDict, google.maps.TravelMode.DRIVING, false)

    await assignHospitalsToSellers(hospitalsDict, sellersDict)
    await assignSellersToAreas(areasDict, sellersDict, hospitalsDict)

    // let counter = 0
    // for (const area of Object.values(areasDict)){
    //     if (!area.seller){
    //         counter++
    //         console.log(counter)
    //         console.log(area)
    //     }
    // }

    // for (const [departmentId, department] of Object.entries(departmentsDict)) {
    //     mapManager.addGeoJSON(`geojson/departments/${departmentId}.geojson`)
    // }

    // let counter = 0

    for (const [areaId, area] of Object.entries(areasDict)) {
        if (area instanceof Municipality) {
            mapManager.addGeoJSON(`geojson/municipalities/${areaId}.geojson`)
        } else if (area instanceof Locality) {
            mapManager.addGeoJSON(`geojson/localities/${areaId}.geojson`)
        }

        // if (!area.seller){
        //     counter++
        //     console.log(counter)
        //     console.log(area)
        // }
    }

    /** @type {Color[]} */
    const availableColors = [
        { normal: "#003566", hover: "#004789" },
        { normal: "#005F73", hover: "#007c96" },
        { normal: "#0A9396", hover: "#0cb3b7" },
        { normal: "#94D2BD", hover: "#addccc" },
        { normal: "#E9D8A6", hover: "#f0e4c2" },
        { normal: "#ffffff", hover: "#e5e5e5" },
        { normal: "#ffc300", hover: "#ffcb23" },
        { normal: "#EE9B00", hover: "#ffac12" },
        { normal: "#CA6702", hover: "#ed7902" },
        { normal: "#BB3E03", hover: "#de4903" },
        { normal: "#AE2012", hover: "#ce2515" },
        { normal: "#9B2226", hover: "#b8282d" },
        { normal: "#890815", hover: "#aa091a" },
    ]

    /** @type {{[sellerId: string]: Color}} */
    const sellersColors = Object.create(null)

    const sellers = Object.values(sellersDict)

    for (let i = 0; i < sellers.length; i++) {
        await mapManager.createSellerMarker(sellers[i])
        sellersColors[sellers[i].id] = availableColors[i % availableColors.length]
    }

    mapManager.map.map.data.setStyle((/** @type {MapFeature} */ feature) => {
        let fillColor = "";
        let hoverColor = "";

        const areaId = feature.getId();
        if (areaId) {
            const area = areasDict[areaId];
            if (area) {
                const department = area instanceof Municipality ? area.department : area.municipality.department;

                if (!excludedDepartments.includes(department.id)) {
                    const seller = area.seller;
                    if (seller) {
                        fillColor = sellersColors[seller.id].normal || "";
                        hoverColor = sellersColors[seller.id].hover || "";
                        feature.setProperty("state", "ASIGNADO");
                    } else {
                        fillColor = "gainsboro";
                        hoverColor = "gainsboro";
                        feature.setProperty("state", "INACCESIBLE");
                    }
                } else {
                    fillColor = "#000000";
                    hoverColor = "#000000";
                    feature.setProperty("state", "EXCLUIDO");
                }
            }
        }

        // Guardar los colores en el feature para luego usarlos en los eventos
        feature.setProperty("fillColor", fillColor);
        feature.setProperty("hoverColor", hoverColor);

        return {
            fillColor: fillColor,
            fillOpacity: 1,
            strokeColor: fillColor,
            strokeWeight: 1,
            strokeOpacity: 1
        };
    });


    // mapManager.map.map.data.addListener("mouseover", (/** @type {MapEvent} */ event) => {
    //     const feature = event.feature;
    //     const hoverColor = feature.getProperty("hoverColor");
    //     if (typeof hoverColor == "string") {
    //         mapManager.map.map.data.overrideStyle(feature, { fillColor: hoverColor });
    //         event.domEvent.stopPropagation();
    //     }
    // });

    // mapManager.map.map.data.addListener("mouseout", (/** @type {MapEvent} */ event) => {
    //     const feature = event.feature;
    //     mapManager.map.map.data.revertStyle(feature);
    // });


    // map.data.addListener("click", (event) => {
    //     map.data.forEach((feature) => {
    //         feature.setProperty("isSelected", false)
    //     });
    //     lastFeature = event.feature
    //     lastFeature.setProperty("isSelected", true);
    // });

    // await mapManager.setFeatureEvents()
}

/**
 * 
 * @returns {Promise<Object<string, Department>>}
 */
async function loadDepartmentsDict() {
    const lines = (await Files.loadTextFile("psv/departments.psv")).split("\n")

    const cols = Files.getColsNames(lines[0].split("|"))

    const departmentsDict = Object.create(null)

    for (let row = 1; row < lines.length; row++) {
        const line = lines[row].split("|")

        const department = new Department(
            line[cols["id"]],
            line[cols["name"]],
            Number(line[cols["population2025"]]),
            Number(line[cols["population2035"]]),
            Number(line[cols["lat"]]),
            Number(line[cols["lng"]])
        )

        departmentsDict[department.id] = department
    }

    return departmentsDict
}

/**
 * 
 * @param {Object<string, Department>?} departmentsDict 
 * @returns {Promise<Object<string, Municipality>>}
 */
async function loadMunicipalitiesDict(departmentsDict = null) {
    const lines = (await Files.loadTextFile("psv/municipalities.psv")).split("\n")

    const cols = Files.getColsNames(lines[0].split("|"))

    const municipalitiesDict = Object.create(null)

    for (let row = 1; row < lines.length; row++) {
        const line = lines[row].split("|")

        const municipality = new Municipality(
            line[cols["id"]],
            line[cols["name"]],
            line[cols["type"]],
            Number(line[cols["population2025"]]),
            Number(line[cols["population2035"]]),
            Number(line[cols["lat"]]),
            Number(line[cols["lng"]])
        )

        if (departmentsDict) {
            let department = departmentsDict[line[cols["departmentId"]]]

            if (department) {
                municipality.department = department
                department.municipalities.push(municipality)
            } else {
                console.error(`Department ${line[cols["departmentId"]]} not found: Municipality ID ${municipality.id}`)
            }
        }

        municipalitiesDict[municipality.id] = municipality
    }

    return municipalitiesDict
}

/**
 * 
 * @param {Object<string, Municipality>?} municipalitiesDict 
 * @returns {Promise<Object<string, Locality>>}
 */
async function loadLocalitiesDict(municipalitiesDict) {
    const lines = (await Files.loadTextFile("psv/localities.psv")).split("\n")

    const cols = Files.getColsNames(lines[0].split("|"))

    const localitiesDict = Object.create(null)

    for (let row = 1; row < lines.length; row++) {
        const line = lines[row].split("|")

        const locality = new Locality(
            line[cols["id"]],
            line[cols["name"]],
            line[cols["type"]],
            Number(line[cols["population2025"]]),
            Number(line[cols["population2035"]]),
            Number(line[cols["lat"]]),
            Number(line[cols["lng"]])
        )

        if (municipalitiesDict) {
            let municipality = municipalitiesDict[line[cols["municipalityId"]]]

            if (municipality) {
                locality.municipality = municipality
                municipality.localities.push(locality)
            } else {
                console.error(`Municipality ${line[cols["municipalityId"]]} not found: Locality ID ${locality.id}`)
            }
        }

        localitiesDict[locality.id] = locality
    }

    return localitiesDict
}

/**
 * 
 * @param {Object<string, Municipality>?} municipalitiesDict 
 * @param {Object<string, Locality>?} localitiesDict 
 * @returns {Promise<Object<string, Hospital>>}
 */
async function loadHospitalsDict(municipalitiesDict, localitiesDict) {
    const lines = (await Files.loadTextFile("psv/hospitals.psv")).split("\n")

    const cols = Files.getColsNames(lines[0].split("|"))

    const hospitalsDict = Object.create(null)

    for (let row = 1; row < lines.length; row++) {
        const line = lines[row].split("|")

        const hospital = new Hospital(
            line[cols["id"]],
            line[cols["nit"]],
            line[cols["name"]],
            Number(line[cols["complexity"]]),
            line[cols["services"]],
            Number(line[cols["lat"]]),
            Number(line[cols["lng"]])
        )

        const area = (localitiesDict && localitiesDict[line[cols["localityId"]]]) || (municipalitiesDict && municipalitiesDict[line[cols["municipalityId"]]]);

        if (area) {
            hospital.area = area;
            area.hospitals.push(hospital);
        }

        if (!hospital.area) {
            console.error(`Area ${line[cols["areaId"]]} not found: Municipality ID ${line[cols["municipalityId"]]}, Locality ID ${line[cols["localityId"]]}`)
        }

        hospitalsDict[hospital.id] = hospital
    }

    return hospitalsDict
}

/**
 * @param {Object<string, Municipality | Locality>?} areasDict 
 * @returns {Promise<Object<string, Seller>>}
 */
async function loadSellersDict(areasDict = null) {

    const objects = await Files.loadJSONFile("json/sellers.json")

    const sellersDict = Object.create(null)

    if (objects instanceof Array) {

        for (const object of objects) {

            const seller = new Seller(object["id"], object["name"], object["address"], object["lat"], object["lng"])

            if (areasDict) {
                const area = areasDict[object["areaId"]]
                if (area) {
                    seller.area = area
                } else {
                    console.error(`Area ${object["areaId"]} not found: Seller ID ${seller.id}`)
                }
            }

            sellersDict[seller.id] = seller
        }
    }

    return sellersDict
}

/**
 * 
 * @param {Object<string, Municipality>} municipalitiesDict 
 * @returns {Object<string, Municipality | Locality>} 
 */
function createAreasDict(municipalitiesDict) {
    const places = Object.create(null)
    for (const municipality of Object.values(municipalitiesDict)) {
        if (municipality.localities.length) {
            for (const locality of Object.values(municipality.localities)) {
                places[locality.id] = locality
            }
        } else {
            places[municipality.id] = municipality
        }
    }
    return places
}

/**
 * @param {Object<string, Hospital>} hospitalsDict
 * @param {Object<string, Seller>} sellersDict
 * @param {number} secondsLimit
 */
async function assignHospitalsToSellers(hospitalsDict, sellersDict, secondsLimit = 0) {

    const response = await fetch("./public/data/jsonl/distancesDrivingHospitalToSeller.jsonl");

    const reader = response.body?.getReader();

    if (reader) {
        const decoder = new TextDecoder("utf-8");

        const processLine = (/** @type {Boolean} */ lastLine = false) => {
            try {
                /** @type {DistanceLine} */
                const distanceLine = JSON.parse(line);

                // @ts-ignore
                const hospitalId = distanceLine["hospital"]

                const hospital = hospitalsDict[hospitalId];

                if (hospital) {
                    if (!blockHospital) {
                        blockHospital = hospital.id;
                    }

                    // @ts-ignore
                    const sellerId = distanceLine["seller"]

                    const seller = sellersDict[sellerId];

                    if (seller) {
                        if (blockHospital != hospital.id || lastLine) {
                            let minDistance = Number.MAX_VALUE;
                            let closestSellerId = "";

                            for (const [distanceSellerId, distance] of Object.entries(distancesDict)) {
                                if (distance < minDistance) {
                                    minDistance = distance;
                                    closestSellerId = distanceSellerId;
                                }
                            }

                            if (secondsLimit ? distancesDict[closestSellerId] <= secondsLimit : true) {
                                const closestHospital = hospitalsDict[blockHospital];
                                const closestSeller = sellersDict[closestSellerId];

                                closestHospital.seller = closestSeller;
                                closestSeller.hospitals.push(closestHospital);
                            }

                            blockHospital = hospital.id

                            distancesDict = { [seller.id]: distanceLine.duration.value }
                        } else {
                            distancesDict[seller.id] = distanceLine.duration.value;
                        }
                    } else {
                        throw new Error(`Seller not found: ${sellerId}`)
                    }
                } else {
                    throw new Error(`Hospital not found: ${hospitalId}`)
                }
            } catch (error) {
                console.error("Error parsing line:", line, error);
            }
        };

        let line = ""
        let blockHospital = ""
        /** @type {Object<string, number>}>} */
        let distancesDict = Object.create(null)

        let partialLine = "";

        while (true) {
            const { value, done } = await reader.read();

            if (done) {
                break;
            } else {
                partialLine += decoder.decode(value, { stream: true });

                const lines = partialLine.split("\n");

                partialLine = lines.pop() || "";

                for (const rawLine of lines) {
                    line = rawLine.trim();

                    if (line) {
                        processLine()
                    };
                }
            }
        }

        line = partialLine.trim();

        if (line) {
            processLine(true)
        }
    }
}

/**
 * 
 * @param {Object<string, Municipality | Locality>} areasDict 
 * @param {Object<string, Seller>} sellersDict 
 * @param {Object<string, Hospital>} hospitalsDict 
 */
async function assignSellersToAreas(areasDict, sellersDict, hospitalsDict) {
    for (const area of Object.values(areasDict)) {
        if (area.hospitals.length) {
            const seller = await assignSellersToAreasByHospitalNumber(area, sellersDict)
            if (seller) {
                area.seller = seller
                seller.areas.push(area)
            }
        }
    }

    await assignSellersToAreasByHospitalDistance(areasDict, hospitalsDict)
}

/**
 * 
 * @param {Municipality | Locality} area 
 * @param {Object<string, Seller>} sellersDict 
 * @returns {Promise<Seller>}
 */
async function assignSellersToAreasByHospitalNumber(area, sellersDict) {
    let maxHospitalsNumber = 0
    let maxHospitalsSeller = ""

    const hospitalsQuantity = Object.create(null)

    for (const hospital of area.hospitals) {
        if (hospital.seller) {
            if (!hospitalsQuantity[hospital.seller.id]) {
                hospitalsQuantity[hospital.seller.id] = 0
            }

            hospitalsQuantity[hospital.seller.id] += 1

            if (maxHospitalsNumber < hospitalsQuantity[hospital.seller.id]) {
                maxHospitalsNumber = hospitalsQuantity[hospital.seller.id]
                maxHospitalsSeller = hospital.seller.id
            }
        }
    }

    return sellersDict[maxHospitalsSeller]
}

/**
 * 
 * @param {Object<string, Municipality | Locality>} areasDict
 * @param {Object<string, Hospital>} hospitalsDict 
 * @param {number} secondsLimit 
 */
async function assignSellersToAreasByHospitalDistance(areasDict, hospitalsDict, secondsLimit = 0) {
    const paths = [
        // "./public/data/jsonl/distancesDrivingHospitalToArea.jsonl",
        "./public/data/jsonl/distancesDrivingHospitalToArea1.jsonl",
        // "./public/data/jsonl/distancesDrivingHospitalToArea2.jsonl",
        // "./public/data/jsonl/distancesDrivingHospitalToArea3.jsonl",
    ]

    for (const path of paths) {
        const response = await fetch(path);

        const reader = response.body?.getReader();

        if (reader) {
            const decoder = new TextDecoder("utf-8");

            const processLine = (/** @type {Boolean} */ lastLine = false) => {
                try {
                    /** @type {DistanceLine} */
                    const distanceLine = JSON.parse(line);

                    // @ts-ignore
                    const areaId = distanceLine["area"];

                    const area = areasDict[areaId]

                    if (area) {
                        if (!blockAreaId) {
                            blockAreaId = area.id;
                        }

                        if (!area.seller) {
                            // @ts-ignore
                            const hospitalId = distanceLine["hospital"]

                            const hospital = hospitalsDict[hospitalId];

                            if (hospital) {
                                if (blockAreaId != area.id || lastLine) {
                                    let minDistance = Number.MAX_VALUE;
                                    let closestHospitalId = "";

                                    for (const [distanceHospitalId, distance] of Object.entries(distancesDict)) {
                                        if (distance < minDistance) {
                                            minDistance = distance;
                                            closestHospitalId = distanceHospitalId;
                                        }
                                    }
                                    
                                    console.log(closestHospitalId)
                                    console.log(distancesDict)

                                    if (secondsLimit ? distancesDict[closestHospitalId] <= secondsLimit : true) {
                                        const closestArea = areasDict[blockAreaId];
                                        const closestHospital = hospitalsDict[closestHospitalId];
                                        
                                        if (closestHospital.seller) {
                                            closestArea.seller = closestHospital.seller
                                            closestHospital.seller.areas.push(closestArea)
                                        } else {
                                            throw new Error(`Hospital doesn't contain seller: ${closestHospital}`)
                                        }
                                    }

                                    blockAreaId = hospital.id

                                    distancesDict = { [hospital.id]: distanceLine.duration.value }
                                } else {
                                    distancesDict[hospital.id] = distanceLine.duration.value;
                                }
                            } else {
                                throw new Error(`Hospital not found: ${hospitalId}`)
                            }
                        }
                    } else {
                        throw new Error(`Area not found: ${areaId}`)
                    }
                } catch (error) {
                    console.error("Error parsing line:", line, error);
                }
            };

            let line = ""
            let blockAreaId = ""
            /** @type {Object<string, number>}>} */
            let distancesDict = Object.create(null)

            let partialLine = "";

            while (true) {
                const { value, done } = await reader.read();

                if (done) {
                    break;
                } else {
                    partialLine += decoder.decode(value, { stream: true });

                    const lines = partialLine.split("\n");

                    partialLine = lines.pop() || "";

                    for (const rawLine of lines) {
                        line = rawLine.trim();

                        if (line) {
                            processLine()
                        };
                    }
                }
            }

            line = partialLine.trim();

            if (line) {
                processLine(true)
            }
        }
    }
}

/**
 * 
 * @param {MapManager} mapManager 
 * @param {Hospital[]} hospitalsDict 
 */
async function searchHospitals(mapManager, hospitalsDict) {
    const searchedHospitals = []

    for (const hospital of Object.values(hospitalsDict)) {
        if (hospital.area) {
            const searchedHospital = await mapManager.map.getNearbyPlace(hospital.name, hospital.area, "hospital")
            searchedHospitals.push(searchedHospital)
        }
    }

    return searchHospitals
}

run()