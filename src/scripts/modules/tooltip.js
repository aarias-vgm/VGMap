/**
 * @typedef {import('./types.js').TooltipHandler} TooltipHandler
 * @typedef {import('./types.js').MapFeature} MapFeature
 * @typedef {import('./types.js').EventType} EventType
 * @typedef {import('./types.js').MapEvent} MapEvent
 * @typedef {import('./types.js').MapData} MapData
 * @typedef {import('./types.js').Rect} Rect
 */

import HTML from './html.js'

/** @type {HTMLElement} */
// @ts-ignore
const inTooltip = document.getElementById("in-tooltip")
/** @type {HTMLElement} */
// @ts-ignore
const clickTooltip = document.getElementById("click-tooltip")
/** @type {HTMLElement} */
// @ts-ignore
const coordsTooltip = document.getElementById("coords-tooltip")

/** @type {HTMLElement[]} */
let openTooltips = []
/** @type {EventTarget?} */
let lastTarget = null
/** @type {EventAdapter} */
// @ts-ignore
let lastEventAdapter = null

/**
 * 
 * @param {HTMLElement} tooltip
 * @param {number} x 
 * @param {number} y 
 */
function setTooltipPosition(tooltip, x, y) {
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

class EventAdapter {

    constructor() {
        if (new.target === EventAdapter) {
            throw new Error("An abstract class cannot be instantiated.");
        }
    }

    /**
     * 
     * @param {any} element 
     * @param {EventType} eventType 
     * @param {TooltipHandler} handler
     */
    onEvent(element, eventType, handler) {
        throw new Error("onEvent method not overwritten yet.");
    }

    /**
     * @param {EventType} eventType 
     * @return {string}
     */
    returnEventName(eventType) {
        throw new Error("returnEventName method not overwritten yet.");
    }

    /**
     * @param {any} event
     * @return {any}
    */
    returnEventTarget(event) {
        throw new Error("returnEventElement method not overwritten yet.");
    }

    /**
     * @param {any} event
     * @return {Rect}
    */
    returnRect(event) {
        throw new Error("setPosition method not overwritten yet.");
    }
}

export class HTMLEventAdapter extends EventAdapter {
    constructor() {
        super()
    }

    /**
     * @param {HTMLElement} element
     * @param {EventType} eventType 
     * @param {TooltipHandler} handler 
    */
    onEvent(element, eventType, handler) {
        element.addEventListener(this.returnEventName(eventType), (/** @type {MouseEvent} */ event) => {
            handler(event)
        });
    }

    /**
     * 
     * @param {EventType} eventType 
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
     * @return {HTMLElement} 
     */
    returnEventTarget(event) {
        // @ts-ignore
        return event.target 
    }

    /**
     * 
     * @param {MouseEvent} event 
     * @return {Rect} 
     */
    returnRect(event) {
        const target = this.returnEventTarget(event)
        return HTML.getRect(target)
    }
}

export class MapEventAdapter extends EventAdapter {
    constructor() {
        super()
    }

    /**
     * @param {MapData} element
     * @param {EventType} eventType
     * @param {TooltipHandler} handler
     */
    onEvent(element, eventType, handler) {
        if (!(element instanceof HTMLElement)) {
            element.addListener(this.returnEventName(eventType), (/** @type {MapEvent} */ event) => {
                handler(event)
            });
        }
    }

    /**
     * 
     * @param {EventType} eventType 
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
     * @param {MapEvent} event 
     * @return {MapFeature} 
     */
    returnEventTarget(event) {
        return event.feature
    }

    /**
     * 
     * @param {MapEvent} event 
     * @return {Rect} 
     */
    returnRect(event) {
        const x = event.domEvent.clientX
        const y = event.domEvent.clientY
        return { x: x, y: y, w: 0, h: 0 }
    }
}

/**
 * 
 * @param {EventAdapter} adapter
 * @param {any} element
 * @param {function(any): string} returnHtml
 * @param {function(Rect, Rect): [number, number]} setPosition
 * @param {function | function[]} functions
 */
function addInTooltip(adapter, element, returnHtml, setPosition, functions = []) {
    const tooltip = inTooltip;
    adapter.onEvent(element, "in", (event) => {
        if (!clickTooltip.classList.contains("visible")) {
            const target = adapter.returnEventTarget(event)
            tooltip.innerHTML = returnHtml(target);
            functions = functions instanceof Array ? functions : [functions]
            functions.forEach(f => f(event))
            const targetRect = adapter.returnRect(event)
            const tooltipRect = HTML.getRect(tooltip)
            setTooltipPosition(tooltip, ...setPosition(targetRect, tooltipRect))
        }
        tooltip.classList.replace("hidden", "visible");
    });
}

/**
 * 
 * @param {EventAdapter} adapter
 * @param {any} element
 * @param {function | function[]} functions
 */
function addOutTooltip(adapter, element, functions = []) {
    const tooltip = inTooltip;
    adapter.onEvent(element, "out", (event) => {
        functions = functions instanceof Array ? functions : [functions]
        functions.forEach(f => f(event));
        tooltip.classList.replace("visible", "hidden");
    });
}

/**
 * 
 * @param {EventAdapter} adapter
 * @param {any} element
 * @param {function((any)): string} returnHtml
 * @param {function(Rect, Rect): [number, number]} setPosition
 * @param {function | function[]} functions
 */
function addClickTooltip(adapter, element, returnHtml, setPosition, functions = []) {
    const tooltip = clickTooltip

    adapter.onEvent(element, "click", (event) => {
        const target = adapter.returnEventTarget(event)
        lastTarget = target;
        console.log(target)
        lastEventAdapter = adapter
        inTooltip.classList.replace("visible", "hidden")
        coordsTooltip.classList.replace("visible", "hidden")
        tooltip.innerHTML = returnHtml(lastTarget)
        functions = functions instanceof Array ? functions : [functions]
        functions.forEach(f => f(event))
        const targetRect = adapter.returnRect(event)
        const tooltipRect = HTML.getRect(tooltip)
        setTooltipPosition(tooltip, ...setPosition(targetRect, tooltipRect))
        tooltip.classList.replace("hidden", "visible");
        if (!openTooltips.includes(tooltip)) {
            openTooltips.push(tooltip)
        }
        document.addEventListener('click', onClickOut)
    });
}

/**
 * 
 * @param {EventAdapter} adapter
 * @param {any} element
 * @param {function((any)): string} returnHtml
 * @param {function(Rect, Rect): [number, number]} setPosition
 * @param {function | function[]} functions
 */
function addCoordsTooltip(adapter, element, returnHtml, setPosition, functions = []) {
    const tooltip = coordsTooltip

    adapter.onEvent(element, "click", (event) => {
        if (tooltip.classList.contains("hidden")) {
            const target = adapter.returnEventTarget(event)
            lastTarget = target
            lastEventAdapter = adapter
            tooltip.innerHTML = returnHtml(lastTarget)
            functions = functions instanceof Array ? functions : [functions]
            functions.forEach(f => f(event))
            tooltip.classList.replace("hidden", "visible");
            const targetRect = adapter.returnRect(event)
            const tooltipRect = HTML.getRect(tooltip)
            setTooltipPosition(tooltip, ...setPosition(targetRect, tooltipRect))
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
    hideTooltip(lastEventAdapter.returnEventTarget(event))
}

/**
* 
* @param {any} target 
*/
function hideTooltip(target) {

    if (target instanceof HTMLElement && target != lastTarget) {

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
    inTooltip: inTooltip,
    clickTooltip: clickTooltip,
    coordsTooltip: coordsTooltip,
    addInTooltip: addInTooltip,
    addOutTooltip: addOutTooltip,
    addClickTooltip: addClickTooltip,
    addCoordsTooltip: addCoordsTooltip
}

export default Tooltip 