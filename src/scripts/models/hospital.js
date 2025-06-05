import { Area } from "./area.js"
import { Place } from "./place.js"
import { Seller } from "./seller.js"

export class Hospital extends Place {

    /**
     * 
     * @param {string} id
     * @param {string} name
     * @param {string} nit
     * @param {number} complexity
     * @param {string} services
     * @param {string} accreditationCode
     * @param {number} lat 
     * @param {number} lng 
     */
    constructor(id, name, nit, complexity, services, accreditationCode, lat, lng) {
        super(id, name, lat, lng)

        this.nit = nit
        this.complexity = complexity
        this.accreditationCode = accreditationCode
        this.services = services

        /** @type {Area} */
        this.area

        /** @type {Seller?} */
        this.seller = null
    }
}