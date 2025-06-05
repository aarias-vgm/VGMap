import DomMarkerController from './domMarkerController.js';

/**
 * @typedef {import('../utils/types.js').Coords} Coords
 */

export default class BaseMarkerController extends DomMarkerController {

    /**
     * 
     * @param {{coords: Coords, className?: string, faClass?: string, backColor?: string, iconColor?: string, borderColor?: string}} params
     * @returns {google.maps.OverlayView?}
     */
    addPinMarker({ coords, className = "", faClass = "", backColor = '#B22222', borderColor = '#DC143C', iconColor = '#FFFFFF' }) {
        /** @type {HTMLTemplateElement} */
        // @ts-ignore
        const markerTemplate = document.getElementById("pin-marker-template");

        const fragment = markerTemplate.content.cloneNode(true);

        if (fragment instanceof DocumentFragment) {
            const marker = fragment.querySelector('.marker');

            if (marker) {
                marker.querySelector('.marker-back')?.setAttribute('fill', backColor);
                marker.querySelector('.marker-border')?.setAttribute('fill', borderColor);

                const iconWrapper = marker.querySelector('.marker-icon-wrapper');

                if (iconWrapper instanceof HTMLElement) {
                    iconWrapper.style.color = iconColor;

                    const svg = iconWrapper.querySelector('svg');

                    if (svg) {
                        const useElement = svg.querySelector('use');

                        if (useElement) {
                            if (faClass) {
                                svg.classList.add("fa-xl")
                            } else {
                                faClass = "fa-circle"
                                svg.classList.add("fa-sm")
                            }

                            useElement.setAttribute('href', `#${faClass}-symbol`);
                        } else {
                            console.error(`${this.addPinMarker.name}: <use> element not found`)
                        }
                    } else {
                        console.error(`${this.addPinMarker.name}: <svg> element not found`)
                    }
                } else {
                    console.error(`${this.addPinMarker.name}: .marker-icon-wrapper class not found`)
                }

                return this.addDomMarker(new google.maps.LatLng(coords), className, marker.outerHTML);
            }
        }

        return null
    }

    /**
     * 
     * @param {{coords: Coords, className?: string, faClass?: string, backColor?: string, iconColor?: string, borderColor?: string}} params
     * @returns {google.maps.OverlayView?}
     */
    addCircularMarker({ coords, className = "", faClass = "", backColor = '#B22222', borderColor = '#FFFFFF', iconColor = '#DC143C' }) {
        /** @type {HTMLTemplateElement} */
        // @ts-ignore
        const markerTemplate = document.getElementById("circular-marker-template");

        const fragment = markerTemplate.content.cloneNode(true);

        if (fragment instanceof DocumentFragment) {
            const marker = fragment.querySelector('.marker');

            if (marker) {
                marker.querySelector('.marker-back')?.setAttribute('fill', backColor);
                marker.querySelector('.marker-border')?.setAttribute('stroke', borderColor);

                const iconWrapper = marker.querySelector('.marker-icon-wrapper');

                if (iconWrapper instanceof HTMLElement) {
                    iconWrapper.style.color = iconColor;

                    const svg = iconWrapper.querySelector('svg');

                    if (svg) {
                        const useElement = svg.querySelector('use');

                        if (useElement) {
                            if (faClass) {
                                svg.classList.add("fa-xl")
                            } else {
                                faClass = "fa-map-pin"
                                svg.classList.add("fa-sm")
                            }

                            useElement.setAttribute('href', `#${faClass}-symbol`);
                        } else {
                            console.error(`${this.addCircularMarker.name}: <use> element not found`)
                        }
                    } else {
                        console.error(`${this.addCircularMarker.name}: <svg> element not found`)
                    }
                } else {
                    console.error(`${this.addCircularMarker.name}: .marker-icon-wrapper class not found`)
                }

                return this.addDomMarker(new google.maps.LatLng(coords), className, marker.outerHTML);
            }
        }

        return null
    }

    /**
     * 
     * @param {{coords: {lat: number, lng: number}, className?: string, faClass?: string, iconColor?: string, borderColor?: string}} params
     * @returns {google.maps.OverlayView?}
     */
    addShapeMarker({ coords, className = '', borderColor = "#DC143C", iconColor = "#FFFFFF", faClass = '' }) {
        /** @type {HTMLTemplateElement} */
        // @ts-ignore
        const markerTemplate = document.getElementById("shape-marker-template");

        const fragment = markerTemplate.content.cloneNode(true);

        if (fragment instanceof DocumentFragment) {
            const marker = fragment.querySelector('.marker');

            if (marker) {
                const iconWrapper = marker.querySelector('.marker-icon-wrapper');

                if (iconWrapper instanceof HTMLElement) {
                    iconWrapper.style.color = iconColor;

                    const svg = iconWrapper.querySelector('svg');

                    if (svg) {
                        svg.setAttribute("fill", iconColor);

                        svg.setAttribute("stroke", borderColor);
                        svg.setAttribute("stroke-width", "20");

                        const useElement = svg.querySelector('use');

                        if (useElement) {
                            if (!faClass) {
                                faClass = "fa-map-pin"
                                svg.classList.add("fa-sm")
                            }

                            svg.classList.add("fa-3xl")

                            useElement.setAttribute('href', `#${faClass}-symbol`);
                        } else {
                            console.error(`${this.addCircularMarker.name}: <use> element not found`)
                        }
                    } else {
                        console.error(`${this.addCircularMarker.name}: <svg> element not found`)
                    }
                } else {
                    console.error(`${this.addCircularMarker.name}: .marker-icon-wrapper class not found`)
                }

                return this.addDomMarker(new google.maps.LatLng(coords), className, marker.outerHTML);
            }
        }

        return null
    }
}
