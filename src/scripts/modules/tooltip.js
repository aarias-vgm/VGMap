/**
 * @typedef {import('./types.js').TooltipHandler} TooltipHandler
 * @typedef {import('./types.js').TooltipEventType} TooltipEventType
 */

/** @type {HTMLElement} */
// @ts-ignore
const inTooltip = document.getElementById("name-tooltip")
/** @type {HTMLElement} */
// @ts-ignore
const clickTooltip = document.getElementById("info-tooltip")
/** @type {HTMLElement} */
// @ts-ignore
const coordsTooltip = document.getElementById("coords-tooltip")

/** @type {HTMLElement[]} */
let openTooltips = []
/** @type {EventTarget?} */
let lastTarget = null
/** @type {TooltipEventAdapter} */
// @ts-ignore
let lastEventAdapter = null


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

class TooltipEventAdapter {

    constructor() {
        if (new.target === TooltipEventAdapter) {
            throw new Error("An abstract class cannot be instantiated.");
        }
    }

    /**
     * 
     * @param {any} element 
     * @param {TooltipEventType} eventType 
     * @param {TooltipHandler} handler
     */
    onEvent(element, eventType, handler) {
        throw new Error("onEvent method not overwritten yet.");
    }

    /**
     * @param {TooltipEventType} eventType 
     * @return {string}
     */
    returnEventName(eventType) {
        throw new Error("returnEventName method not overwritten yet.");
    }

    /**
     * @param {any} event
     * @return {any}
    */
    returnEventElement(event) {
        throw new Error("returnEventElement method not overwritten yet.");
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

    /**
     * 
     * @param {MouseEvent} event 
     * @return {HTMLElement?} 
     */
    returnEventElement(event) {
        return event.target instanceof HTMLElement ? event.target : null
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

    /**
     * 
     * @param {google.maps.Data.MouseEvent} event 
     * @return {google.maps.Data.Feature?} 
     */
    returnEventElement(event) {
        return event instanceof google.maps.Data.Feature ? event.feature : null
    }
}

/**
 * 
 * @param {TooltipEventAdapter} adapter
 * @param {any} element
 * @param {function((any)): string} returnHtml
 * @param {function | function[]} functions
 */
function addInTooltip(adapter, element, returnHtml, functions = []) {
    const tooltip = inTooltip;
    adapter.onEvent(element, "in", (event) => {
        const target = adapter.returnEventElement(event)
        if (!clickTooltip.classList.contains("visible")) {
            tooltip.innerHTML = returnHtml(target);
            functions = functions instanceof Array ? functions : [functions]
            functions.forEach(f => f(event));
            tooltip.classList.replace("hidden", "visible");
        }
    });
}

/**
 * 
 * @param {TooltipEventAdapter} adapter
 * @param {any} element
 * @param {function | function[]} functions
 */
function addOutTooltip(adapter, element, functions = []) {
    const tooltip = inTooltip;
    adapter.onEvent(element, "out", (event) => {
        const target = adapter.returnEventElement(event)
        functions = functions instanceof Array ? functions : [functions]
        functions.forEach(f => f(event));
        tooltip.classList.replace("visible", "hidden");
    });
}

/**
 * 
 * @param {TooltipEventAdapter} adapter
 * @param {any} element
 * @param {function((any)): string} returnHtml
 * @param {function | function[]} functions
 */
function addClickTooltip(adapter, element, returnHtml, functions = []) {
    const tooltip = clickTooltip

    adapter.onEvent(element, "click", (event) => {
        const target = adapter.returnEventElement(event)
        lastTarget = target
        lastEventAdapter = adapter
        inTooltip.classList.replace("visible", "hidden")
        coordsTooltip.classList.replace("visible", "hidden")
        tooltip.innerHTML = returnHtml(lastTarget)
        functions = functions instanceof Array ? functions : [functions]
        functions.forEach(f => f(event))
        tooltip.classList.replace("hidden", "visible");
        if (!openTooltips.includes(tooltip)) {
            openTooltips.push(tooltip)
        }
        document.addEventListener('click', onClickOut)
    });
}

/**
 * 
 * @param {TooltipEventAdapter} adapter
 * @param {any} element
 * @param {function((any)): string} returnHtml
 * @param {function | function[]} functions
 */
function addCoordsTooltip(adapter, element, returnHtml, functions = []) {
    const tooltip = coordsTooltip

    adapter.onEvent(element, "click", (event) => {
        if (tooltip.classList.contains("hidden")) {
            const target = adapter.returnEventElement(event)
            lastTarget = target
            lastEventAdapter = adapter
            tooltip.innerHTML = returnHtml(lastTarget)
            functions = functions instanceof Array ? functions : [functions]
            functions.forEach(f => f(event))
            tooltip.classList.replace("hidden", "visible");
            if (!openTooltips.includes(tooltip)) {
                openTooltips.push(tooltip)
            }
            document.addEventListener('click', onClickOut)
        }
    });
}

/**
 * 
 * @param {any} event 
 */
function onClickOut(event) {
    hideTooltip(lastEventAdapter.returnEventElement(event))
}

/**
* 
* @param {any} target 
*/
function hideTooltip(target) {

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

const Tooltip = {
    setPosition: setPosition,
    inTooltip: inTooltip,
    clickTooltip: clickTooltip,
    coordsTooltip: coordsTooltip,
    addInTooltip: addInTooltip,
    addOutTooltip: addOutTooltip,
    addClickTooltip: addClickTooltip,
    addCoordsTooltip: addCoordsTooltip
}

export default Tooltip 