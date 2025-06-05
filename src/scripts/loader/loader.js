import { DIANKEY, MAPCENTER } from "../utils/constants.js";
import Data, { hospitalsDict, sellersDict, areasDict, municipalitiesDict, placesDict } from "../data/data.js"
import MapController from '../core/mapController.js';
import BaseMarkerController from "../core/baseMarkerController.js";
import GeocoderController from "../core/geocoderController.js";
import Files from "../utils/files.js";
import Haversine from "../utils/haversine.js";

let isLoaded = false

async function loadGoogleMaps() {
    if (!isLoaded) {
        (g => {
            // @ts-ignore
            var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n))
        })({
            key: DIANKEY,
            v: "weekly" // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
            // Add other bootstrap parameters as needed, using camel case.
        });

        isLoaded = true;
    }
}

export async function loadApp() {
    await Data.loadData();

    await loadGoogleMaps();

    const mapController = new MapController();
    await mapController.init();

    // const geocoderController = new GeocoderController()
    // await geocoderController.init()

    // const area = municipalitiesDict["11001"]

    // const query = `${area.name}, Colombia`
    // // const query = `${area.name}, ${area.department.name}, Colombia`

    // const info = await geocoderController.getPlaceInfo({address: query})
    // // const info = await geocoderController.getPlaceInfo({placeId: "ChIJKcumLf2bP44RFDmjIFVjnSM"})

    // console.log(info)

    let searchedLines = (await Files.loadTextFile("psv/search.psv")).split("\n")

    /**
     * @type {Object[]}
    */
    const result = []

    const colsNames = Files.getColsNames(searchedLines[0].split("|"))

    // searchedLines = searchedLines.slice(1)

    // searchedLines.forEach(line => {
    //     const cols = line.split("|")

    //     const place = placesDict[cols[colsNames["id"]]]

    //     const parentPlace = placesDict[cols[colsNames["parentId"]]]

    //     const distance = Haversine.calculateKmDistance({ lat: Number(cols[colsNames["lat"]]), lng: Number(cols[colsNames["lng"]]) }, place.coords)

    //     result.push({ name: `${cols[colsNames["name"]]}, ${parentPlace.name}`, distance: distance })
    // })

    // Files.savePSV(result)

    const baseMarkerController = new BaseMarkerController(mapController.Map);
    await baseMarkerController.init();

    baseMarkerController.addShapeMarker({coords: MAPCENTER, className: "otter", faClass: "fa-otter", iconColor: "#B8860B", borderColor: "#8B4513"})

    Object.values(hospitalsDict).forEach(hospital => {
        baseMarkerController.addPinMarker({ coords: hospital.coords, className: "hospital-marker", faClass: "fa-hospital", backColor: "#ffffff", iconColor: "#DC143C", borderColor: "#8B0000" })
    });

    Object.values(sellersDict).forEach(seller => {
        baseMarkerController.addCircularMarker({ coords: seller.coords, className: "seller-marker", faClass: "fa-person-walking-luggage", backColor: "#00BFFF", iconColor: "#FFFFFF", borderColor: "#ffffff" })
    })



}