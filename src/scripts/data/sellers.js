import { Area } from "../models/area.js"
import { Seller } from "../models/seller.js"
import Files from "../utils/files.js"

/**
 * @param {{[id: string]: Area}} areasDict 
 * @returns {Promise<{[id: string]: Seller}>}
 */
export async function loadSellersDict(areasDict) {
    const objects = await Files.loadJSONFile("json/sellers.json")

    /** @type {{[id: string]: Seller}} */
    const sellersDict = {}

    if (objects instanceof Array) {
        for (const object of objects) {

            const seller = new Seller(
                object["id"],
                object["name"],
                object["address"],
                object["lat"],
                object["lng"]
            )

            const area = areasDict[object["areaId"]]

            if (area) {
                seller.area = area
            } else {
                console.error(`Area ID ${object["areaId"]} not found: Seller ID ${seller.id}`)
            }

            sellersDict[seller.id] = seller
        }
    }

    return sellersDict
}