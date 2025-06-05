export class Point {

    /**
     * @param {number} lat 
     * @param {number} lng 
     */
    constructor(lat = 0, lng = 0) {

        this.lat = lat
        this.lng = lng
    }

    /**
     * 
     * @returns {{lat: number, lng: number}}
     */
    get coords() {
        return { "lat": this.lat, "lng": this.lng }
    }
}