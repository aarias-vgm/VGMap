// 📁 scripts/main.js
import { loadApp } from './loader/loader.js';
import { loadVectorSymbols, loadMarkersTemplates } from './loader/preLoader.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadVectorSymbols()
    await loadMarkersTemplates()
    await loadApp()
});

