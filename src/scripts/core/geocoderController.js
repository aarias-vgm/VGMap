import { Area } from "../models/area.js";
import Files from "../utils/files.js";

export default class GeocoderController {

    constructor() {
        /** @type {google.maps.Geocoder} */
        this.Geocoder
    }

    async init() {
        // @ts-ignore
        const { Geocoder } = await google.maps.importLibrary("geocoding");

        this.Geocoder = new Geocoder()
    }

    /**
     * 
     * @param {google.maps.GeocoderRequest} request 
     * @returns {Promise<{query: string, address: string, adminArea1: string, adminArea2: string, coords: {lat: number, lng: number}, placeId: string}[]?>}
     */
    async getPlaceInfo(request) {

        return new Promise((resolve) => {
            this.Geocoder.geocode(request, (results, status) => {
                if (status === "OK" && results && results.length) {
                    const info = []
                    for (const result of results) {
                        let adminArea1 = "", adminArea2 = ""

                        result.address_components.forEach((addressComponent) => {
                            if (addressComponent.types.includes("administrative_area_level_1")) {
                                adminArea1 = addressComponent.long_name;
                            }
                            if (addressComponent.types.includes("administrative_area_level_2")) {
                                adminArea2 = addressComponent.long_name;
                            }
                        });

                        info.push({
                            query: request.address || "",
                            placeId: result.place_id,
                            coords: { lat: result.geometry?.location?.lat(), lng: result.geometry?.location?.lng() },
                            address: result.formatted_address,
                            adminArea1: adminArea1,
                            adminArea2: adminArea2,
                            partialMatch: result.partial_match,
                            locationType: result.geometry.location_type
                        })
                    }

                    resolve(info);
                }
            });
        });
    }

    /**
    * @param {Area[]} areas 
    */
    async getAreasInfo(areas) {
        const a = document.createElement("a");

        let counter = 0
        let maxCount = areas.length

        let lines = []

        for (const area of areas) {
            counter++
            try {
                console.info(`${area.name} | ${counter} of ${maxCount} [${(counter / (maxCount / 100)).toFixed(2)}%]`);

                let department = ""
                let municipality = ""

                switch (area.type) {
                    case "municipio":
                    case "isla":
                    case "área no municipalizada":
                        department = area.parentArea.name
                        municipality = area.name
                        break;
                    case "localidad":
                        department = area.parentArea.parentArea.name
                        municipality = area.parentArea.name
                        break;
                }

                let query = `${area.name}, ${area.parentArea.name}`

                const infoList = await this.getPlaceInfo({ address: query, region: "co", componentRestrictions: { country: "CO", administrativeArea: department, locality: municipality } })

                if (infoList) {
                    lines.push(...infoList)
                }
            } catch (error) {
                console.error("Error calculating place ID: " + error)
            }
        }

        if (lines.length) {
            Files.saveJSONL(lines, "areasInfo", a);
        }
    }
}