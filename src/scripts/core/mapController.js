import { MAPCENTER, MAPSTYLES } from "../utils/constants.js";

export default class MapController {

    constructor() {
        /** @type {google.maps.Map} */
        this.Map
    }

    async init() {
        // @ts-ignore
        const { Map } = await google.maps.importLibrary("maps");

        this.Map = new Map(document.getElementById("map"), {
            center: { lat: MAPCENTER.lat, lng: MAPCENTER.lng },
            zoom: 5.8,
            maxZoom: 50,
            minZoom: 2,
            styles: MAPSTYLES,
            cameraControl: false,
            clickableIcons: false,
            disableDefaultUI: true,
            fullscreenControl: true,
            mapTypeControl: false,
            rotateControl: false,
            scaleControl: false,
            streetViewControl: true,
            zoomControl: true,
        });
    }
}