/**
 *
 * @param {string} url
 * @param {string} fragmentId
 * @param {"append" | "prepend" | "replace"} [mode]
 * @returns {Promise<void>}
 */
async function loadFragment(url, fragmentId, mode = "append") {
    const container = document.querySelector(fragmentId);

    if (!container) {
        throw new Error(`Container not found: ${fragmentId}`);
    } else {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Error loading ${url}: ${res.status}`);
        } else {
            const text = await res.text();
    
            switch (mode) {
                case 'append':
                    container.insertAdjacentHTML('beforeend', text);
                    break;
                case 'prepend':
                    container.insertAdjacentHTML('afterbegin', text);
                    break;
                case 'replace':
                    container.innerHTML = text;
            }
        }
    }
}

export async function loadVectorSymbols() {
    await loadFragment('src/assets/svg/fa-circle-symbol.svg', '#vector-symbols').catch(console.error);
    await loadFragment('src/assets/svg/fa-hospital-symbol.svg', '#vector-symbols').catch(console.error);
    await loadFragment('src/assets/svg/fa-map-pin-symbol.svg', '#vector-symbols').catch(console.error);
    await loadFragment('src/assets/svg/fa-person-walking-luggage-symbol.svg', '#vector-symbols').catch(console.error);
    await loadFragment('src/assets/svg/fa-map-symbol.svg', '#vector-symbols').catch(console.error);
    await loadFragment('src/assets/svg/fa-otter-symbol.svg', '#vector-symbols').catch(console.error);
}

export async function loadMarkersTemplates() {
    await loadFragment('templates/pin-marker.html', '#markers-templates').catch(console.error);
    await loadFragment('templates/circular-marker.html', '#markers-templates').catch(console.error);
    await loadFragment('templates/shape-marker.html', '#markers-templates').catch(console.error);
}