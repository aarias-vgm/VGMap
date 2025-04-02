/**
 * 
 * @param {HTMLButtonElement} button 
 * @param {string | number} text 
 */
function copyText(button, text) {
    console.log("copied")
    navigator.clipboard.writeText(`${text}`)
        .then(() => {
            setTimeout(() => button.blur(), 10);
            setTimeout(() => button.focus(), 10);
        })
        .catch((error) => {
            console.error(`Could not copy text: ${error}`);
        });
}

// /**
//  * 
//  * @param {HTMLButtonElement} button 
//  * @param {function[]} functions 
//  */
// function setClickFunctions(button, functions){
//     button.onclick = () => {
//         functions.forEach(f => f())
//     }
// }

const Button = {
    copyText: copyText,
    // setClickFunctions: setClickFunctions
}

export default Button