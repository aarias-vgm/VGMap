/**
 * 
 * @param {string} fileName 
 * @returns {Promise<any>}
 */
async function loadJSONFile(fileName) {
    return await fetch(`./public/data/${fileName}`).then(res => res.json());
}

/**
 * 
 * @param {string} fileName 
 * @returns {Promise<string>}
 */
async function loadPlainFile(fileName) {
    return await fetch(`./public/data/${fileName}`).then(res => res.text());
}

/**
 * 
 * @param {string[]} header 
 * @returns {Object<string, number>}
 */
function getColsNames(header) {
    return header.reduce((accumulator, value, index) => {
        accumulator[value.trim()] = index;
        return accumulator;
    }, Object.create(null));
}

/**
 * Download a file using <a> element.
 * @param {string} content
 * @param {string} mimeType
 * @param {string} fileName
 * @param {HTMLAnchorElement?} a
 */
async function downloadFile(content, mimeType, fileName, a = null) {
    if (!a) {
        a = document.createElement("a");
    }

    a.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
    a.download = fileName;
    a.click();

    await new Promise(resolve => setTimeout(resolve, 250));

    console.info(`"${a.download}" successfully downloaded.`);

    URL.revokeObjectURL(a.href);
}

/**
 * Transform data into PSV type and download it.
 * @param {Object[]} data
 * @param {string} name
 * @param {HTMLAnchorElement?} a
*/
async function savePSV(data, name = "file", a = null) {
    const headers = Object.keys(data[0]).join("|");
    const rows = data.map(row => Object.values(row).join("|"));
    const content = [headers, ...rows].join("\n");

    await downloadFile(content, "text/csv", `${name}.psv`, a);
}

/**
 * Transform data into JSON type and download it.
 * @param {any} data
 * @param {string} name
 * @param {string} ext
 * @param {HTMLAnchorElement?} a
 */
async function saveJSON(data, name = "file", ext = "json", a = null) {
    const content = JSON.stringify(data);

    await downloadFile(content, "application/json", `${name}.${ext}`, a);
}

/**
 * Transform data into JSONL type and download it.
 * @param {Object[]} data
 * @param {string} name
 * @param {HTMLAnchorElement?} a
 */
async function saveJSONL(data, name = "file", a = null) {
    const lines = data.map((/** @type {any} */ obj) => JSON.stringify(obj));
    const content = lines.join("\n");

    await downloadFile(content, "application/x-ndjson", `${name}.jsonl`, a);
}

const Files = {
    getColsNames: getColsNames,
    loadTextFile: loadPlainFile,
    loadJSONFile: loadJSONFile,
    savePSV: savePSV,
    saveJSON: saveJSON,
    saveJSONL: saveJSONL
}

export default Files