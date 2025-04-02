/**
 * 
 * @param {number} milliseconds 
 * @returns {Promise<any>}
 */
async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * 
 * @param {number} number 
 * @returns {number}
 */
function getRandomNumber(number) {
    return Math.floor(Math.random() * number);
}

/**
 * 
 * @param {*[]} array 
 */
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * 
 * @param {string} text 
 * @returns {string}
 */
function fromUpperToCamelCase(text) {
    const excepciones = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 'con', 'por', 'para', 'a', 'o'];

    return text
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
            if (index === 0 || !excepciones.includes(word)) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            } else {
                return word;
            }
        })
        .join(' ');
}

/**
 * 
 * @param {string} text 
 * @returns {string}
 */
function normalizeText(text) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
}

const Utils = {
    sleep: sleep,
    getRandomNumber: getRandomNumber,
    getRandomElement: getRandomElement,
    normalizeText: normalizeText,
    fromUpperToCamelCase: fromUpperToCamelCase
}

export default Utils