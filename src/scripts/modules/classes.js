export class Point {

    /** @type {number} */
    lat
    /** @type {number} */
    lng

    /**
     * @param {number} lat 
     * @param {number} lng 
     */
    constructor(lat, lng) {
        this.lat = lat
        this.lng = lng
    }

    /**
     * 
     * @returns {{lat: number, lng: number}}
    */
    getLatLng() {
        return { "lat": this.lat, "lng": this.lng }
    }
}

export class Place extends Point {

    /** @type {string} */
    id
    /** @type {string} */
    name

    /**
     * @param {string} name 
     * @param {number} lat 
     * @param {number} lng 
     * @param {string} id 
     */
    constructor(name, lat, lng, id = "") {
        super(lat, lng)
        this.id = id
        this.name = name
    }
}

export class Area extends Place {

    /** @type {number} */
    population
    /** @type {number} */
    estimatedPopulation

    /**
     * 
     * @param {string} id 
     * @param {string} name 
     * @param {number} population 
     * @param {number} estimatedPopulation 
     * @param {number} lat 
     * @param {number} lng 
     */
    constructor(id, name, population, estimatedPopulation, lat, lng) {
        super(name, lat, lng, id)
        this.population = population
        this.estimatedPopulation = estimatedPopulation
    }
}

export class Department extends Area {

    /** @type {Municipality[]} */
    municipalities

    /**
     * 
     * @param {string} id 
     * @param {string} name 
     * @param {number} population 
     * @param {number} estimatedPopulation 
     * @param {number} lat 
     * @param {number} lng 
    */
    constructor(id, name, population, estimatedPopulation, lat, lng) {
        super(id, name, population, estimatedPopulation, lat, lng)
        this.population = population
        this.estimatedPopulation = estimatedPopulation
        this.municipalities = []
    }
}

export class Municipality extends Area {

    /** @type {string} */
    type
    /** @type {Department} */
    department
    /** @type {Locality[]} */
    localities
    /** @type {Hospital[]} */
    hospitals
    /** @type {Seller?} */
    seller

    /**
     * 
     * @param {string} id
     * @param {string} name 
     * @param {string} type 
     * @param {number} population
     * @param {number} estimatedPopulation
     * @param {number} lat 
     * @param {number} lng 
    */
    constructor(id, name, type, population, estimatedPopulation, lat, lng) {
        super(id, name, population, estimatedPopulation, lat, lng)
        this.type = type
        // @ts-ignore
        this.department = undefined
        this.localities = []
        this.hospitals = []
        this.seller = null
    }
}

export class Locality extends Area {
    /** @type {string} */
    type
    /** @type {Municipality} */
    municipality
    /** @type {Hospital[]} */
    hospitals
    /** @type {Seller?} */
    seller

    /**
     * 
     * @param {string} id
     * @param {string} name 
     * @param {string} type 
     * @param {number} population
     * @param {number} estimatedPopulation
     * @param {number} lat 
     * @param {number} lng 
    */
    constructor(id, name, type, population, estimatedPopulation, lat, lng) {
        super(id, name, population, estimatedPopulation, lat, lng)
        this.type = type
        // @ts-ignore
        this.municipality = undefined
        this.hospitals = []
        this.seller = null
    }
}

export class Hospital extends Place {

    /** @type {string} */
    nit
    /** @type {number} */
    complexity
    /** @type {string} */
    services
    /** @type {(Municipality | Locality)?} */
    area
    /** @type {Seller?} */
    seller

    /**
     * 
     * @param {string} id 
     * @param {string} nit 
     * @param {string} name 
     * @param {number} complexity 
     * @param {string} services
     * @param {number} lat 
     * @param {number} lng 
    */
    constructor(id, nit, name, complexity, services, lat, lng) {
        super(name, lat, lng, id)
        this.nit = nit
        this.complexity = complexity
        this.services = services
        this.area = null
        this.seller = null
    }
}

export class Seller extends Place {

    /** @type {string} */
    address
    /** @type {Hospital[]} */
    hospitals
    /** @type {(Municipality | Locality)?} */
    area
    /** @type {(Municipality | Locality)[]} */
    areas


    /**
     * 
     * @param {string} id
     * @param {string} name 
     * @param {string} address  
     * @param {number} lat  
     * @param {number} lng 
     */
    constructor(id, name, address, lat, lng) {
        super(name, lat, lng, id)
        this.address = address
        this.hospitals = []
        this.area = null
        this.areas = []
    }
}