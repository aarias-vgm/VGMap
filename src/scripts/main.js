import { Department, Municipality, Hospital, Seller, Locality } from "./modules/classes.js"
import MapManager from "./modules/mapManager.js"
import Files from "./modules/files.js"
import Utils from "./modules/utils.js"

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

    // await mapManager.map.importPlacesService()
    // await mapManager.map.importDistanceService()
    // await mapManager.map.importGeocoderService()

    // const foundedAreas = await searchAreas(mapManager, areasDict)
    // Files.saveJSON(foundedAreas)
    // return

    // await mapManager.calculatePlacesDistances(departmentsDict, departmentsDict, google.maps.TravelMode.DRIVING)
    // await mapManager.calculatePlacesDistances(hospitalsDict, sellersDict, google.maps.TravelMode.DRIVING)
    // await mapManager.calculatePlacesDistances(hospitalsDict, areasDict, google.maps.TravelMode.DRIVING, ["hospital", "area"])

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

        if (!area.seller) {
            console.log(area)
        }
        // if (!area.seller){
        //     counter++
        //     console.log(counter)
        //     console.log(area)
        // }
    }

    /** @type {Color[]} */
    const availableColors = [
        { back: "#99CC33", fore: "#FFFFFF", accent: "#7aa329", accent2: "#B3D966" /** #A3D147 #A8D452 #ADD65C #B3D966 #B8DB70 #BDDE7A */ },
        { back: "#3CB371", fore: "#FFFFFF", accent: "#409666", accent2: "#63C28D" /** #50BB7F #59BE86 #63C28D #6DC695 #77CA9C #80CEA3 */ },
        { back: "#00846A", fore: "#FFFFFF", accent: "#006a55", accent2: "#269680" /** #1A9079 #269680 #339D88 #40A38F #4DA997 #59AF9E */ },
        { back: "#00BBE1", fore: "#FFFFFF", accent: "#0096b4", accent2: "#33C9E7" /** #1AC2E4 #26C5E6 #33C9E7 #40CCE9 #4DCFEA #59D3EC */ },
        { back: "#006699", fore: "#FFFFFF", accent: "#00527a", accent2: "#267DA8" /** #1A75A3 #267DA8 #3385AD #408CB3 #4D94B8 #599CBD */ },
        { back: "#31A0B9", fore: "#FFFFFF", accent: "#278094", accent2: "#5AB3C7" /** #46AAC0 #50AEC4 #5AB3C7 #65B8CB #6FBDCE #79C1D2 */ },
        { back: "#61DAD8", fore: "#FFFFFF", accent: "#4eaead", accent2: "#98E7E6" /** #71DEDC #79E0DE #81E1E0 #89E3E2 #90E5E4 #98E7E6 */ },
        { back: "#B22222", fore: "#FFFFFF", accent: "#7D1818", accent2: "#BA3838" /** #BA3838 #BE4343 #C14E4E #C55959 #C96464 #CD6F6F */ },
        { back: "#DC143C", fore: "#FFFFFF", accent: "#972940", accent2: "#DC4F6B" /** #DC4F6B #DE5874 #E0627C #E26C84 #E4788C #E68094 */ },
        { back: "#C71585", fore: "#FFFFFF", accent: "#8B0F5D", accent2: "#CF3897" /** #CD2C91 #CF3897 #D2449D #D550A4 #D85BAA #D85BAA */ },
        { back: "#E65689", fore: "#FFFFFF", accent: "#A13C60", accent2: "#EA6F9B" /** #E96795 #EA6F9B #EB78A1 #EC80A7 #EE89AC #EF91B2 */ },
        { back: "#8558B3", fore: "#FFFFFF", accent: "#5D3E7D", accent2: "#AE94E4" /** #9169BB #9771BE #9D79C2 #A482C6 #AA8ACA #B092CE */ },
        { back: "#6225cc", fore: "#FFFFFF", accent: "#451A8F", accent2: "#723BD1" /** #723BD1 #7A46D4 #8151D6 #895CD9 #9166DB #9971DE */ },
        { back: "#FF6600", fore: "#FFFFFF", accent: "#cc5200", accent2: "#FF8533" /** #FF751A #FF7D26 #FF8533 #FF8C40 #FF944D #FF9C59 */ },
        { back: "#FF9900", fore: "#FFFFFF", accent: "#cc7a00", accent2: "#FFB340" /** #FFA31A #FFA826 #FFAD33 #FFB340 #FFB84D #FFBD59 */ },
        { back: "#FFCC00", fore: "#FFFFFF", accent: "#cca300", accent2: "#FFDE59" /** #FFD11A #FFD426 #FFD633 #FFD940 #FFDB4D #FFDE59 */ },
    ]

    /** @type {{[sellerId: string]: Color}} */
    const sellersColors = Object.create(null)

    const sellers = Object.values(sellersDict)


    for (let i = 0; i < sellers.length; i++) {
        let randomNumber = Utils.getRandomNumber(availableColors.length)

        while (Object.values(sellersColors).includes(availableColors[randomNumber])) {
            randomNumber = Utils.getRandomNumber(availableColors.length)
        }

        sellersColors[sellers[i].id] = availableColors[randomNumber]

        await mapManager.createSellerMarker(sellers[i], sellersColors[sellers[i].id])
    }

    // for (const hospital of Object.values(hospitalsDict)) {
    //     if (hospital.complexity = ){
    //         await mapManager.createHospitalMarker(hospital)
    //     }
    // }

    mapManager.map.map.data.setStyle((/** @type {MapFeature} */ feature) => {
        let fillColor = ""
        let hoverColor = ""
        let strokeColor = ""
        let strokeWeight = 1
        let strokeOpacity = 1

        const areaId = feature.getId();
        if (areaId) {
            const area = areasDict[areaId];
            if (area) {
                const department = area instanceof Municipality ? area.department : area.municipality.department;

                if (!excludedDepartments.includes(department.id)) {
                    const seller = area.seller;
                    if (seller) {
                        fillColor = sellersColors[seller.id].back
                        hoverColor = sellersColors[seller.id].accent
                        strokeColor = sellersColors[seller.id].accent2 || ""
                        feature.setProperty("state", "ASIGNADO");
                        strokeWeight = 2
                    } else {
                        fillColor = "#ebebeb";
                        hoverColor = "#c4c4c4";
                        strokeColor = "#ffffff"
                        feature.setProperty("state", "INACCESIBLE");
                    }
                } else {
                    fillColor = "#A9A9A9";
                    hoverColor = "#808080";
                    strokeColor = "#A9A9A9"
                    feature.setProperty("state", "EXCLUIDO");
                }
            }
        }


        feature.setProperty("fillColor", fillColor);
        feature.setProperty("hoverColor", hoverColor);

        return {
            fillColor: fillColor,
            fillOpacity: 1,
            strokeColor: strokeColor,
            strokeWeight: strokeWeight,
            strokeOpacity: strokeOpacity
        };
    });

    await mapManager.createFeatureTooltips(areasDict)



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

        const processLine = (/** @type {Boolean} */ endLine = false) => {
            try {
                /** @type {DistanceLine} */
                const distanceLine = JSON.parse(line);

                // @ts-ignore
                const currentHospitalId = distanceLine["hospital"]

                const currentHospital = hospitalsDict[currentHospitalId];

                if (currentHospital) {
                    if (!storedHospitalId) {
                        storedHospitalId = currentHospital.id;
                    }

                    // @ts-ignore
                    const currentSellerId = distanceLine["seller"]

                    const currentSeller = sellersDict[currentSellerId];

                    if (currentSeller) {
                        if (storedHospitalId != currentHospital.id || endLine) {
                            let minDuration = Number.MAX_VALUE;
                            let closestSellerId = "";

                            for (const [sellerId, duration] of Object.entries(distancesDict)) {
                                if (duration < minDuration) {
                                    minDuration = duration;
                                    closestSellerId = sellerId;
                                }
                            }

                            if (secondsLimit ? distancesDict[closestSellerId] <= secondsLimit : true) {
                                const closestHospital = hospitalsDict[storedHospitalId];
                                const closestSeller = sellersDict[closestSellerId];

                                closestHospital.seller = closestSeller;
                                closestSeller.hospitals.push(closestHospital);
                            }

                            storedHospitalId = currentHospital.id

                            distancesDict = { [currentSeller.id]: distanceLine.duration.value }
                        } else {
                            distancesDict[currentSeller.id] = distanceLine.duration.value;
                        }
                    } else {
                        throw new Error(`Seller not found: ${currentSellerId}`)
                    }
                } else {
                    throw new Error(`Hospital not found: ${currentHospitalId}`)
                }
            } catch (error) {
                console.error("Error parsing line:", line, error);
            }
        };

        let line = ""
        let storedHospitalId = ""
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
                    const currentAreaId = distanceLine["area"];

                    const currentArea = areasDict[currentAreaId]

                    if (currentArea) {

                        if (!currentArea.seller) {

                            if (!storedAreaId) {
                                storedAreaId = currentArea.id;
                            }

                            // @ts-ignore
                            const currentHospitalId = distanceLine["hospital"]

                            const currentHospital = hospitalsDict[currentHospitalId];

                            if (currentHospital) {
                                if (storedAreaId != currentArea.id || lastLine) {
                                    let minDuration = Number.MAX_VALUE;
                                    let closestHospitalId = "";

                                    for (const [hospitalId, duration] of Object.entries(distancesDict)) {
                                        if (duration < minDuration) {
                                            minDuration = duration;
                                            closestHospitalId = hospitalId;
                                        }
                                    }

                                    if (secondsLimit ? distancesDict[closestHospitalId] <= secondsLimit : true) {
                                        const closestArea = areasDict[storedAreaId];
                                        const closestHospital = hospitalsDict[closestHospitalId];

                                        if (closestHospital.seller != null) {
                                            closestArea.seller = closestHospital.seller
                                            closestHospital.seller.areas.push(closestArea)
                                        } else {
                                            console.info(`Hospital doesn't contain seller: ${closestHospital}`)
                                        }
                                    }

                                    storedAreaId = currentArea.id

                                    distancesDict = { [currentHospital.id]: distanceLine.duration.value }
                                } else {
                                    distancesDict[currentHospital.id] = distanceLine.duration.value;
                                }
                            } else {
                                throw new Error(`Hospital not found: ${currentHospitalId}`)
                            }
                        }
                    } else {
                        throw new Error(`Area not found: ${currentAreaId}`)
                    }
                } catch (error) {
                    console.error("Error parsing line:", line, error);
                }
            };

            let line = ""
            let storedAreaId = ""
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
 * @param {Object<string, Municipality | Locality>} areasDict 
 */
async function searchAreas(mapManager, areasDict) {
    const searchedAreas = []

    let counter = 0
    const total = Object.values(areasDict).length

    for (const area of Object.values(areasDict)) {
        counter++
        const searchedArea = await mapManager.map.getNearbyPlace(area.name, "", area,)
        console.log(`[${counter} de ${total}] | ${area.name}`)
        searchedAreas.push(searchedArea)
    }

    return searchedAreas
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
            const searchedHospital = await mapManager.map.getNearbyPlace(hospital.name, "hospital", hospital.area)
            searchedHospitals.push(searchedHospital)
        }
    }

    return searchHospitals
}

run()