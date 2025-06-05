import { Area } from "./area.js"
import { Hospital } from "./hospital.js"
import { Place } from "./place.js"

export class Seller extends Place {

    /**
     * 
     * @param {string} id
     * @param {string} name 
     * @param {string} address  
     * @param {number} lat  
     * @param {number} lng 
     */
    constructor(id, name, address, lat, lng) {
        super(id, name, lat, lng)
        this.address = address

        /** @type {Hospital[]} */
        this.hospitals = []

        /** @type {Area} */
        this.area

        /** @type {Area[]} */
        this.salesAreas = []
    }
}