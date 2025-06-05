import { Point } from "./point.js"

export class Place extends Point {

    /**
     * @param {string} id
     * @param {string} name
     * @param {number} lat
     * @param {number} lng
     */
    constructor(id, name, lat, lng) {
        super(lat, lng)

        this.id = id
        this.name = name
    }
}