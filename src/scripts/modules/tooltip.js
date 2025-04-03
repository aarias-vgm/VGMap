/**
 * @typedef {import('./types.js').TooltipEvent} TooltipEvent
 * @typedef {import('./types.js').TooltipHandler} TooltipHandler
 * @typedef {import('./types.js').TooltipEventType} TooltipEventType
 */

/** @type {HTMLElement} */
// @ts-ignore
const nameTooltip = document.getElementById("name-tooltip")
/** @type {HTMLElement} */
// @ts-ignore
const infoTooltip = document.getElementById("info-tooltip")
/** @type {HTMLElement} */
// @ts-ignore
const coordsTooltip = document.getElementById("coords-tooltip")

/** @type {HTMLElement[]} */
let openTooltips = []
/** @type {EventTarget?} */
let lastTarget = null

/**
 * 
 * @param {HTMLElement} tooltip
 * @param {number} x 
 * @param {number} y 
 */
function setPosition(tooltip, x, y) {
    const offset = 20

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;

    if (x < (width / 2) + offset) {
        x = (width / 2) + offset
    } else if (x > screenWidth - (width / 2) - offset) {
        x = screenWidth - (width / 2) - offset;
    }

    if (y < offset) {
        y = offset;
    } else if (y > screenHeight - height) {
        y = screenHeight - offset
    }

    tooltip.style.position = "absolute";
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
}

/**
 * 
 * @param {TooltipEvent} event 
 */
function onClickOut(event) {
    hideTooltip(event)
}

/**
* 
* @param {TooltipEvent} event 
*/
function hideTooltip(event) {
    const target = event instanceof MouseEvent ? event.target : event.domEvent.target

    if (target instanceof Node && target != lastTarget) {

        let targetIndex = openTooltips.findIndex((descendant) => descendant.contains(target)); // target index == -1: target is not a descendant

        if (targetIndex != -1) {
            for (let i = openTooltips.length - 1; targetIndex < i; i--) {
                openTooltips[i].classList.replace("visible", "hidden");
                openTooltips.splice(i, 1)
            }
        }
        else {
            for (const openTooltip of openTooltips) {
                openTooltip.classList.replace("visible", "hidden");
            }
            openTooltips = []
        }
    }

    if (!openTooltips) {
        document.removeEventListener('click', onClickOut);
    }
}

class TooltipEventAdapter {

    constructor() {
        if (new.target === TooltipEventAdapter) {
            throw new Error("No se puede instanciar esta clase abstracta.");
        }
    }

    /**
     * 
     * @param {HTMLElement | google.maps.Data} element 
     * @param {TooltipEventType} eventType 
     * @param {TooltipHandler} handler
     */
    onEvent(element, eventType, handler) {
        throw new Error("El método onEvent no ha sido reescrito.");
    }

    /**
     * @param {TooltipEventType} eventType 
     * @return {string}
     */
    returnEventName(eventType) {
        throw new Error("El método returnEventName no ha sido reescrito.");
    }
}

export class HTMLTooltipEventAdapter extends TooltipEventAdapter {
    constructor() {
        super()
    }

    /**
     * @param {HTMLElement} element
     * @param {TooltipEventType} eventType 
     * @param {TooltipHandler} handler 
    */
    onEvent(element, eventType, handler) {
        element.addEventListener(this.returnEventName(eventType), (/** @type {MouseEvent} */ event) => {
            handler(event)
        });
    }

    /**
     * 
     * @param {TooltipEventType} eventType 
     * @returns {"mouseenter" | "mouseleave" | "click" | "mousemove"}
     */
    returnEventName(eventType) {
        switch (eventType) {
            case "in":
                return "mouseenter"
            case "out":
                return "mouseleave"
            case "click":
                return "click"
            case "move":
                return "mousemove"

        }
    }
}

export class MapTooltipEventAdapter extends TooltipEventAdapter {
    constructor() {
        super()
    }

    /**
     * @param {google.maps.Data} element
     * @param {TooltipEventType} eventType
     * @param {TooltipHandler} handler
     */
    onEvent(element, eventType, handler) {
        if (!(element instanceof HTMLElement)) {
            element.addListener(this.returnEventName(eventType), (/** @type {google.maps.Data.MouseEvent} */ event) => {
                handler(event)
            });
        }
    }

    /**
     * 
     * @param {TooltipEventType} eventType 
     * @returns {"mouseover" | "mouseout" | "click" | "mousemove"}
     */
    returnEventName(eventType) {
        switch (eventType) {
            case "in":
                return "mouseover"
            case "out":
                return "mouseout"
            case "click":
                return "click"
            case "move":
                return "mousemove"
        }
    }
}

/**
 * 
 * @param {TooltipEventAdapter} adapter
 * @param {HTMLElement | google.maps.Data} element
 * @param {function((TooltipEvent)): string} setHtml
 * @param {function | function[]} functions
 */
function addNameTooltip(adapter, element, setHtml, functions = []) {
    const tooltip = nameTooltip;
    adapter.onEvent(element, "in", (event) => {
        if (!infoTooltip.classList.contains("visible")) {
            tooltip.innerHTML = setHtml(event);
            functions = functions instanceof Array ? functions : [functions]
            functions.forEach(f => f());
            tooltip.classList.replace("hidden", "visible");
        }
    });

    adapter.onEvent(element, "out", (event) => {
        tooltip.classList.replace("visible", "hidden");
    });
}

/**
 * 
 * @param {TooltipEventAdapter} adapter
 * @param {HTMLElement | google.maps.Data} element
 * @param {function((TooltipEvent)): string} setHtml
 * @param {function | function[]} functions
 */
function addInfoTooltip(adapter, element, setHtml, functions = []) {
    const tooltip = infoTooltip
    adapter.onEvent(element, "click", (event) => {
        nameTooltip?.classList.replace("visible", "hidden")
        coordsTooltip?.classList.replace("visible", "hidden")
        tooltip.innerHTML = setHtml(event)
        functions = functions instanceof Array ? functions : [functions]
        functions.forEach(f => f())
        tooltip.classList.replace("hidden", "visible");
        lastTarget = event instanceof MouseEvent ? event.target : event.domEvent.target
        if (!openTooltips.includes(tooltip)) {
            openTooltips.push(tooltip)
        }
        document.addEventListener('click', onClickOut);
    });
}

/**
 * 
 * @param {TooltipEventAdapter} adapter
 * @param {HTMLElement | google.maps.Data} element
 * @param {function((TooltipEvent)): string} setHtml
 * @param {function | function[]} functions
 */
function addCoordsTooltip(adapter, element, setHtml, functions = []) {
    const tooltip = coordsTooltip
    adapter.onEvent(element, "click", (event) => {
        if (tooltip.classList.contains("hidden")) {
            tooltip.innerHTML = setHtml(event)
            functions = functions instanceof Array ? functions : [functions]
            functions.forEach(f => f())
            tooltip.classList.replace("hidden", "visible");
            lastTarget = event instanceof MouseEvent ? event.target : event.domEvent.target
            if (!openTooltips.includes(tooltip)) {
                openTooltips.push(tooltip)
            }
            document.addEventListener('click', onClickOut);
        }
    });
}

const Tooltip = {
    setPosition: setPosition,
    nameTooltip: nameTooltip,
    infoTooltip: infoTooltip,
    coordsTooltip: coordsTooltip,
    addNameTooltip: addNameTooltip,
    addInfoTooltip: addInfoTooltip,
    addCoordsTooltip: addCoordsTooltip
}

export default Tooltip 