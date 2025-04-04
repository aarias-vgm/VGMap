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

const Button = {
    copyText: copyText,
}

export default Button