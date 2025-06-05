/**
 * 
 * @param {number} milliseconds 
 * @returns {Promise<any>}
 */
async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const Time = {
    sleep: sleep
}

export default Time