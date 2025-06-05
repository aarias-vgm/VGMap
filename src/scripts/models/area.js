import { Hospital } from "./hospital.js"
import { Place } from "./place.js"

/**
 * Administrative Area class
 */
export class Area extends Place {

    /**
     * 
     * @param {string} id
     * @param {string} name
     * @param {"departamento" | "municipio" | "isla" | "área no municipalizada" | "localidad"} type
     * @param {number} lat
     * @param {number} lng
     */
    constructor(id, name, type, lat, lng) {
        super(id, name, lat, lng)

        this.type = type

        this.population = 0
        this.estimatedPopulation = 0

        this.density = 0
        this.estimatedDensity = 0

        /** @type {Area} */
        this.parentArea

        /** @type {Area[]} */
        this.subareas = []
        
        /** @type {Hospital[]} */
        this.hospitals = []
    }
}