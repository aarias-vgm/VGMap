import { Department, Municipality, Hospital, Seller, Locality } from "./modules/classes.js"
import MapManager from "./modules/mapManager.js"
import Files from "./modules/files.js"

async function run() {

    const departmentsDict = await loadDepartmentsDict()

    const municipalitiesDict = await loadMunicipalitiesDict(departmentsDict)

    const localitiesDict = await loadLocalitiesDict(municipalitiesDict)

    const areasDict = createAreasDict(municipalitiesDict)

    const hospitalsDict = await loadHospitalsDict(municipalitiesDict)

    const sellersDict = await loadSellersDict()

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

    // await mapManager.map.importDistanceService()
    // await mapManager.map.importGeocoderService()

    // await mapManager.calculatePlacesDistances(departmentsDict, departmentsDict, google.maps.TravelMode.DRIVING, true)
    //await mapManager.calculatePlacesDistances(hospitalsDict, sellersDict, google.maps.TravelMode.DRIVING, true)
    // await mapManager.calculatePlacesDistances(hospitalsDict, areasDict, google.maps.TravelMode.DRIVING, true)

    // await assignHospitalsToSellers(hospitalsDict, sellersDict)

    // let sum = 0
    // for (const seller of Object.values(sellersDict)) {
    //     sum += seller.hospitals.length
    //     console.log(seller.hospitals)
    // }
    // console.log(sum)
    // assignSellersToMunicipalities(municipalitiesDict, sellersDict, excludedDepartments)

    // hospitalsDict = Object.entries(hospitalsDict)
    //     .filter(([id, hospital]) => hospital.complexity == 1)
    //     .reduce((/** @type {Dict} */ accumulator, [id, valor]) => {
    //         accumulator[id] = valor;
    //         return accumulator;
    //     }, {});

    // const municipalitiesWithHospitals = []
    // for (const municipality of Object.values(municipalitiesDict)){
    //     if (municipality.hospitals.length > 0){
    //         municipalitiesWithHospitals.push(municipality.id)
    //     }
    // }

    // hospitalsDict = Object.entries(hospitalsDict)
    //     .filter(([id, hospital]) =>
    //         validMunicipalities.includes(hospital.municipality?.id)
    //     )
    //     .reduce((/** @type {Dict} */ accumulator, [id, valor]) => {
    //         accumulator[id] = valor;
    //         return accumulator;
    //     }, {});

    // for (const [departmentId, department] of Object.entries(departmentsDict)) {
    //     mapManager.addGeoJSON(`geojson/departments/${departmentId}.geojson`)
    // }

    const box = document.getElementById("box")

    mapManager.map.map.data.setStyle({
        zIndex: 0,
        clickable: false,
    })

    if (box) {
        // mapManager.map.map.data.addListener("mouseover", (/** @type {google.maps.Data.MouseEvent} */ event) => {
        //     event.domEvent.stopPropagation()
        //     box.style.left = event.domEvent.clientX + "px";
        //     box.style.top =  event.domEvent.clientY + "px";
        //     box.style.display = "block";
        // });
    }

    // mapManager.addGeoJSON(`geojson/departments/11.geojson`)

    // mapManager.addGeoJSON(`geojson/municipalities/${municipalitiesDict[municipalityWithHospital.id].id}.geojson`)

    // for (const hospital of Object.values(hospitalsDict)) {
    //     if (hospital.municipality && hospital.municipality.id == municipalityWithHospital.id){
    //         await mapManager.createHospitalMarker(hospital)
    //     }
    // }

    const availableColors = [
        "#003566",
        "#005F73",
        "#0A9396",
        "#94D2BD",
        "#E9D8A6",
        "#ffffff",
        "#ffc300",
        "#EE9B00",
        "#CA6702",
        "#BB3E03",
        "#AE2012",
        "#9B2226",
        "#890815",
    ]

    const sellerColors = Object.create(null)

    const sellers = Object.values(sellersDict)

    for (let i = 0; i < sellers.length; i++) {
        await mapManager.createSellerMarker(sellers[i])
        sellerColors[sellers[i].id] = availableColors[i % availableColors.length - 1]
    }

    for (const hospital of Object.values(hospitalsDict).slice(0, 20)) {
        await mapManager.createHospitalMarker(hospital)
    }

    // console.log(sellers)

    // Evento para mostrar el menú con click derecho
    // mapManager.map.googleMap.addListener("rightclick", (event) => {
    //     lastClickedCoords = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    //     contextMenu.style.left = event.pixel.x + "px";
    //     contextMenu.style.top = event.pixel.y + "px";
    //     contextMenu.style.display = "block";
    // });

    // for (const [areaId, area] of Object.entries(areasDict)) {
    //     if (area instanceof Municipality) {
    //         if (!area.localities.length) {
    //             await mapManager.addGeoJSON(`geojson/municipalities/${areaId}.geojson`)
    //         }
    //     } else {
    //         await mapManager.addGeoJSON(`geojson/localities/${areaId}.geojson`)
    //     }
    // }

    // mapManager.map.map.data.setStyle((feature) => {

    //     let areaId = ""

    //     try {
    //         areaId = feature.getId()
    //     } catch (error) {
    //         console.error(areaId)
    //     }

    //     let fillColor = "#000000"

    //     // @ts-ignore
    //     if (areaId) {
    //         const area = areasDict[areaId]
    //         if (area) {
    //             let departmentId
    //             if (area instanceof Municipality) {
    //                 departmentId = area.department.id
    //             } else if (area instanceof Locality) {
    //                 departmentId = area.municipality.department.id
    //             }

    //             // @ts-ignore
    //             if (excludedDepartments.includes(departmentId)) {
    //                 fillColor = "#ff0000"
    //             } else {
    //                 fillColor = sellerColors[area.seller?.id]
    //             }
    //         }
    //     } else {
    //         console.log(feature)
    //     }

    //     return {
    //         fillColor: fillColor,
    //         fillOpacity: 1,
    //         strokeColor: "white",
    //         strokeWeight: 2,
    //         strokeOpacity: 1
    //     };
    // })

    // mapManager.map.map.data.setStyle((feature) => {
    //     const municipalityId = String(feature.getProperty("id"))

    //     const seller = municipalitiesDict[municipalityId].seller

    //     let fillColor = ""

    //     if (seller){
    //         console.log(seller.id)
    //         fillColor = sellerColors[seller.id]
    //     } else {
    //         console.log("NO")
    //         fillColor = "#000000"
    //     }

    //     return {
    //         fillColor: fillColor,
    //         fillOpacity: 1,
    //         strokeColor: "white",
    //         strokeWeight: 2,
    //         strokeOpacity: 1
    //     };
    // });

    //     let contextMenu;
    //     // @ts-ignore
    //     let lastClickedCoords;
    // contextMenu = document.getElementById("coord-button");
    // if (contextMenu){

    // contextMenu.style.position = "absolute";
    // contextMenu.style.display = "flex";
    // contextMenu.style.background = "#fff";
    // contextMenu.style.padding = "8px";
    // contextMenu.style.border = "1px solid #ccc";
    // contextMenu.style.boxShadow = "2px 2px 10px rgba(0,0,0,0.3)";
    // contextMenu.style.borderRadius = "5px";
    // document.body.appendChild(contextMenu);

    // // Agregar botón de copiar
    // const copyBtn = document.createElement("button");
    // copyBtn.innerText = "Copiar Coordenadas";
    // copyBtn.style.cursor = "pointer";
    // copyBtn.style.padding = "5px 10px";
    // copyBtn.style.border = "none";
    // copyBtn.style.background = "#007bff";
    // copyBtn.style.color = "#fff";
    // copyBtn.style.borderRadius = "3px";

    // copyBtn.onclick = () => {
    //     if (lastClickedCoords) {
    //         console.log("copied")
    //         const text = `${lastClickedCoords.lat}, ${lastClickedCoords.lng}`;
    //         navigator.clipboard.writeText(text)
    //             .then(() => {
    //                 setTimeout(() => copyBtn.blur(), 10);
    //                 setTimeout(() => copyBtn.focus(), 10);
    //             })
    //             .catch((error) => {
    //                 console.error(`Could not copy text: ${error}`);
    //             });
    //     }
    //     contextMenu.style.display = "none"; // Ocultar después de copiar
    // };

    // contextMenu.appendChild(copyBtn);
    // }


    // Evento para mostrar el menú con click derecho
    // mapManager.map.googleMap.addListener("rightclick", (event) => {
    //     lastClickedCoords = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    //     contextMenu.style.left = event.pixel.x + "px";
    //     contextMenu.style.top = event.pixel.y + "px";
    //     contextMenu.style.display = "block";
    // });

    // // Cerrar menú si se hace click en otro lado
    // mapManager.map.googleMap.addListener("click", () => {
    //     contextMenu.style.display = "none";
    // });

    // mapManager.map.googleMap.data.addListener("rightclick", (event) => {
    //     if (event.feature) {
    //         const geometry = event.feature.getGeometry();

    //         if (geometry.getType() === "Polygon" || geometry.getType() === "MultiPolygon") {
    //             // Si el departamento es un polígono, usamos el primer punto
    //             const firstCoord = geometry.getAt(0).getAt(0);
    //             lastClickedCoords = { lat: firstCoord.lat(), lng: firstCoord.lng() };
    //         } else if (geometry.getType() === "Point") {
    //             // Si es un punto, tomamos sus coordenadas directamente
    //             lastClickedCoords = { lat: geometry.get().lat(), lng: geometry.get().lng() };
    //         }

    //         console.log(event)

    //         // Mostrar el menú en la posición del click
    //         contextMenu.style.left = event.latLng.lat()
    //         contextMenu.style.top = event.latLng.lng()
    //         contextMenu.style.display = "block";
    //     }
    // });
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
async function loadHospitalsDict(municipalitiesDict = null, localitiesDict = null) {
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

        if (municipalitiesDict) {
            let municipality = municipalitiesDict[line[cols["municipalityId"]]]

            if (municipality) {
                hospital.municipality = municipality
                municipality.hospitals.push(hospital)

                if (localitiesDict) {
                    let locality = localitiesDict[line[cols["localityId"]]]

                    if (locality) {
                        hospital.locality = locality
                    }
                }
            }
        }

        hospitalsDict[hospital.id] = hospital
    }

    return hospitalsDict
}

/**
 * @param {Object<string, Municipality>?} municipalitiesDict 
 * @param {Object<string, Locality>?} localitiesDict 
 * @returns {Promise<Object<string, Seller>>}
 */
async function loadSellersDict(municipalitiesDict = null, localitiesDict = null) {

    const objects = await Files.loadJSONFile("json/sellers.json")

    const sellersDict = Object.create(null)

    if (objects instanceof Array) {

        for (const object of objects) {

            const seller = new Seller(object["id"], object["name"], object["address"], object["lat"], object["lng"])

            if (municipalitiesDict) {
                let municipality = municipalitiesDict[object["municipalityId"]]

                if (municipality) {
                    seller.municipality = municipality

                    if (localitiesDict) {
                        let locality = localitiesDict[object["localityId"]]

                        if (locality) {
                            seller.locality = locality
                            seller.locality.municipality = municipality
                        }
                    }
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
 */
async function assignHospitalsToSellers(hospitalsDict, sellersDict) {
    const response = await fetch("./public/data/ndjson/distancesDrivingHospitalToSeller.ndjson");

    const reader = response.body?.getReader();
    if (reader) {
        const decoder = new TextDecoder("utf-8");

        let currentPlace1Id = ""
        let partialLine = "";

        let distancesObject = Object.create(null)

        const processLine = (/** @type {Object<string, number>}>} */ distancesObject, /** @type {string} */ line) => {
            try {
                const distance = JSON.parse(line);
                const hospital = hospitalsDict[distance["hospital"]]
                const seller = sellersDict[distance["seller"]]

                if (!currentPlace1Id) {
                    currentPlace1Id = hospital.id
                } else {
                    if (currentPlace1Id == hospital.id) {

                        distancesObject[seller.id] = distance.duration.value
                    } else {
                        let minDistance = Number.MAX_VALUE
                        let minDistanceSellerId = ""

                        for (const [sellerId, distance] of Object.entries(distancesObject)) {
                            if (distance < minDistance) {
                                minDistance = distance
                                minDistanceSellerId = sellerId
                            }
                        }

                        if (minDistance <= 14400) {
                            const currentHospital = hospitalsDict[currentPlace1Id]
                            const currentSeller = sellersDict[minDistanceSellerId]

                            currentHospital.seller = currentSeller
                            currentSeller.hospitals.push(currentHospital)

                            if (currentHospital.municipality.department.name === "Atlántico") {
                                console.log("En Barranquilla me quedo. :v")
                            }
                        }

                        currentPlace1Id = hospital.id

                        distancesObject = Object.create(null)
                    }
                }
            } catch (error) {
                console.error("Error parsing line:", line, error);
            }
        }

        while (true) {
            const { value, done } = await reader.read();

            if (done) {
                break;
            } else {
                partialLine += decoder.decode(value, { stream: true });

                const lines = partialLine.split("\n");

                partialLine = lines.pop() || "";

                for (const rawLine of lines) {
                    const line = rawLine.trim();

                    if (line) {
                        processLine(distancesObject, line)
                    };
                }
            }
        }

        const finalLine = partialLine.trim();

        if (finalLine) {
            processLine(distancesObject, finalLine)
        }
    }

    console.log(sellersDict)
}

/**
 * 
 * @param {MapManager} mapManager 
 * @param {Hospital[]} hospitalsDict 
 */
async function searchHospitals(mapManager, hospitalsDict) {
    const searchedHospitals = []

    for (const hospital of Object.values(hospitalsDict)) {
        const searchedHospital = await mapManager.map.getNearbyPlace(hospital.name, hospital.municipality, "hospital")
        searchedHospitals.push(searchedHospital)
    }

    return searchHospitals
}

run()