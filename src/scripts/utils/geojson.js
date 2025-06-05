import Files from './files.js';
import { transformUpperToNameCase } from './helpers.js';

/**
 * @typedef {import('./types.js').Feature} Feature
 * @typedef {import('./types.js').FeatureCollection} FeatureCollection
 */

/**
 * 
 * @param {string} properties 
 * @returns {{"old": string, "new": string}[]} 
 */
function splitProperties(properties) {
    if (properties) {
        return properties.split(",").map(value => { const splittedValue = value.trim().split(":"); return { "old": splittedValue[0], "new": splittedValue[1] } })
    } else {
        return []
    }
}

/**
 * 
 * @param {string} key 
 * @param {Feature} feature 
 * @returns {string}
 */
function evalVariableKey(key, feature) {
    const template = key.replace(/%(\w+)%/g, (_, varName) => {
        return `\${feature.properties['${varName}']}`;
    });
    return eval('`' + template + '`');
}

async function createGeoJSON() {
    const idKeyElement1 = document.getElementById("id-key-1")
    const varKeyElement1 = document.getElementById("var-key-1")
    const idKeyElement2 = document.getElementById("id-key-2")
    const propertiesElement1 = document.getElementById("properties-1")
    const propertiesElement2 = document.getElementById("properties-2")
    const file1 = document.getElementById("file-1")
    const file2 = document.getElementById("file-2")
    const constantsElement = document.getElementById("constants")
    const areaFactorElement = document.getElementById("area-factor")
    if (
        idKeyElement1 && idKeyElement1 instanceof HTMLInputElement &&
        varKeyElement1 && varKeyElement1 instanceof HTMLInputElement &&
        propertiesElement1 && propertiesElement1 instanceof HTMLTextAreaElement &&
        file1 instanceof HTMLInputElement && file1.files && file1.files[0] &&
        constantsElement instanceof HTMLInputElement &&
        areaFactorElement instanceof HTMLInputElement
    ) {
        const idKey1 = idKeyElement1.value

        const varKey1 = varKeyElement1.value

        const properties1 = splitProperties(propertiesElement1.value)

        /** @type {FeatureCollection} */
        const featureCollection1 = JSON.parse(await file1.files[0].text())

        /** @type {Object<string, Feature>} */
        const indexedFeatures1 = Object.create(null)

        const constants = constantsElement.value.split(";")

        const areaFactor = Number(areaFactorElement.value) || 1

        for (const feature of featureCollection1.features) {
            const id = feature.properties[idKey1]

            const newProperties = Object.create(null)
            for (const property of properties1) {
                newProperties[property["new"]] = feature.properties[property["old"]]
            }
            feature.properties = newProperties

            indexedFeatures1[id] = feature
        }

        /** @type {Object<string, Feature>} */
        const indexedFeatures2 = Object.create(null)

        let addFeature2 = false

        if (
            idKeyElement2 && idKeyElement2 instanceof HTMLInputElement &&
            propertiesElement2 && propertiesElement2 instanceof HTMLTextAreaElement &&
            file2 instanceof HTMLInputElement && file2.files && file2.files[0]
        ) {
            addFeature2 = true

            const idKey2 = idKeyElement2.value
            const properties2 = splitProperties(propertiesElement2.value)

            /** @type {FeatureCollection} */
            const featureCollection2 = JSON.parse(await file2.files[0].text())

            for (const feature of featureCollection2.features) {
                const id = feature.properties[idKey2]

                const newProperties = Object.create(null)
                for (const property of properties2) {
                    newProperties[property["new"]] = feature.properties[property["old"]]
                }
                feature.properties = newProperties

                indexedFeatures2[id] = feature
            }
        }

        let isFound = true

        const features = []

        for (const id in indexedFeatures1) {
            const feature1 = indexedFeatures1[id];

            let feature2 = undefined
            if (addFeature2) {
                feature2 = indexedFeatures2[id]
                if (!feature2) {
                    isFound = false
                    console.error(`Feature with id ${id} not found on set 2`)
                    break
                }
            }

            const properties = { ...feature1.properties, ...feature2?.properties }

            constants.forEach(constant => {
                const [key, value] = constant.trim().split(":")
                properties[key] = value
            });

            properties["name"] = transformUpperToNameCase(properties["name"])
            properties["type"] = typeof properties["type"] == "string" ? properties["type"].toLowerCase() : properties["type"]
            properties["area"] = typeof properties["area"] == "number" ? Math.round(properties["area"] * areaFactor) : properties["area"]
            properties["density2025"] = typeof properties["area"] == "number" ? Number.isInteger(properties["density2025"]) ? properties["density2025"] : properties["density2025"].toFixed(2) : properties["density2025"]
            properties["density2035"] = typeof properties["area"] == "number" ? Number.isInteger(properties["density2035"]) ? properties["density2035"] : properties["density2035"].toFixed(2) : properties["density2035"]

            const feature = {
                id: varKey1 ? evalVariableKey(varKey1, feature1) : id,
                type: "Feature",
                properties: properties,
                geometry: feature1.geometry,
            };

            features.push(feature)
        }

        if (isFound) {
            const a = document.createElement("a");
            for (const feature of features) {
                await Files.saveJSON(feature, feature.id, "geojson", a)
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault()
            await createGeoJSON()
        });
    }
});