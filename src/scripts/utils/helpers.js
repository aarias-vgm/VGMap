/**
 * 
 * @param {number} number 
 * @returns {number}
 */
export function getRandomNumber(number) {
    return Math.floor(Math.random() * number);
}

/**
 * 
 * @param {*[]} array 
 */
export function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * 
 * @param {string} text 
 * @returns {string}
 */
export function transformUpperToNameCase(text) {
    const excepciones = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 'con', 'por', 'para', 'a', 'o'];

    return text
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
            if (word.includes('.') && /^[a-z.]+$/.test(word)) {
                return word.toUpperCase();
            } else {
                if (!excepciones.includes(word)) {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                } else {
                    return word
                }
            }
        })
        .join(' ');
}