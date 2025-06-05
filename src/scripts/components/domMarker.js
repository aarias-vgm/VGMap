/**
 * @typedef {import('../utils/types.js').DomMarker} DomMarker
 */

/**
 * @param {typeof google.maps.OverlayView} OverlayView
 * @returns {DomMarker}
 */
export function createDomMarkerClass(OverlayView) {
    return class DomMarker extends OverlayView {
        /**
         * @param {google.maps.Map} map
         * @param {google.maps.LatLng} coords
         * @param {string} className
         * @param {string} innerHtml
         */
        constructor(map, coords, className, innerHtml) {
            super();

            this.setMap(map);
            this.coords = coords;

            this.container = document.createElement("div");
            this.container.classList.add("marker");
            if (className) {
                this.container.classList.add(className);
            }
            this.container.innerHTML = innerHtml;
            
            this.container.classList.add("drop");
        }

        onAdd() {
            // @ts-ignore
            this.getPanes().overlayMouseTarget.appendChild(this.container);

            this.container.addEventListener("animationend", () => {
                this.container.classList.remove("drop");
            }, { once: true });
        }

        draw() {
            const pos = this.getProjection().fromLatLngToDivPixel(this.coords);
            if (pos) {
                this.container.style.position = "absolute";

                this.container.style.left = `${pos.x}px`;
                this.container.style.top = `${pos.y}px`;

                this.container.style.transform = "translate(-50%, -100%)";
            }
        }

        onRemove() {
            this.container.remove();
        }
    };
}