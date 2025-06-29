// main.js

// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const palette = document.getElementById('palette');
const colorCountInput = document.getElementById('colorCount');
const algorithmSelect = document.getElementById('algorithm');
const unlockAllBtn = document.getElementById('unlockAllBtn');
const hueOffsetSlider = document.getElementById('hueOffset');
const satOffsetSlider = document.getElementById('satOffset');
const lightOffsetSlider = document.getElementById('lightOffset');

const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const resetSlidersBtn = document.getElementById('resetSlidersBtn');
const applySlidersBtn = document.getElementById('applySlidersBtn');
const saveSwatchesBtn = document.getElementById('saveSwatchesBtn');

// New DOM Elements for Toggle Hex Codes and Toggle Locked Visibility
const toggleHexCodes = document.getElementById('toggleHexCodes');
const toggleLockedVisibility = document.getElementById('toggleLockedVisibility');

// Event Listeners
generateBtn.addEventListener('click', () => {
    saveState();
    generatePalette();
});

colorCountInput.addEventListener('change', () => {
    saveState();
    adjustPaletteSize();
});

unlockAllBtn.addEventListener('click', () => {
    saveState();
    unlockAllColors();
});

hueOffsetSlider.addEventListener('input', () => {
    hueOffset = parseInt(hueOffsetSlider.value) || 0;
    renderPalette();
});

satOffsetSlider.addEventListener('input', () => {
    satOffset = parseInt(satOffsetSlider.value) || 0;
    renderPalette();
});

lightOffsetSlider.addEventListener('input', () => {
    lightOffset = parseInt(lightOffsetSlider.value) || 0;
    renderPalette();
});

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
resetSlidersBtn.addEventListener('click', resetSliders);
applySlidersBtn.addEventListener('click', applyAdjustments);
saveSwatchesBtn.addEventListener('click', saveSwatches);

// New Event Listener for Toggle Hex Codes Visibility
toggleHexCodes.addEventListener('change', () => {
    if (toggleHexCodes.checked) {
        document.body.classList.remove('hide-hex-codes');
    } else {
        document.body.classList.add('hide-hex-codes');
    }
});

// Existing Event Listener for Toggle Locked Visibility
toggleLockedVisibility.addEventListener('change', () => {
    if (toggleLockedVisibility.checked) {
        document.body.classList.add('show-locked');
    } else {
        document.body.classList.remove('show-locked');
    }
});

// Initialize the application
adjustPaletteSize();
saveState();

// Function to save swatches as an image
function saveSwatches() {
    const swatchWidth = 100;
    const swatchHeight = 100;
    const swatchCount = colors.length;

    const canvas = document.createElement('canvas');
    canvas.width = swatchWidth * swatchCount;
    canvas.height = swatchHeight;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < swatchCount; i++) {
        const color = colors[i];
        const adjustedH = adjustHue(color.h);
        const adjustedS = adjustSat(color.s);
        const adjustedL = adjustLight(color.l);
        ctx.fillStyle = `hsl(${adjustedH}, ${adjustedS}%, ${adjustedL}%)`;
        ctx.fillRect(i * swatchWidth, 0, swatchWidth, swatchHeight);
    }

    // Create a link to download the image
    const link = document.createElement('a');
    link.download = 'palette.png';
    link.href = canvas.toDataURL('image/png');

    // For Firefox compatibility
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Keydown Event Listener
document.addEventListener('keydown', (event) => {
    const { key, ctrlKey, shiftKey } = event;

    if (key === ' ' && !ctrlKey && !shiftKey) {
        // Space: Generate new palette
        event.preventDefault();
        generateBtn.click();
    } else if (ctrlKey && key === 'z' && !shiftKey) {
        // Ctrl + Z: Undo
        event.preventDefault();
        undoBtn.click();
    } else if (ctrlKey && shiftKey && key === 'Z') {
        // Ctrl + Shift + Z: Redo
        event.preventDefault();
        redoBtn.click();
    } else if (ctrlKey && key === 's' && !shiftKey) {
        // Ctrl + S: Save to Favorites
        event.preventDefault();
        savePaletteBtn.click();
    } else if (ctrlKey && key === 'e' && !shiftKey) {
        // Ctrl + E: Save Swatch Image
        event.preventDefault();
        saveSwatchesBtn.click();
    } else if (ctrlKey && key === 'ArrowUp') {
        // Ctrl + Up Arrow: Increase number of colors
        event.preventDefault();
        changeColorCount(1);
    } else if (ctrlKey && key === 'ArrowDown') {
        // Ctrl + Down Arrow: Decrease number of colors
        event.preventDefault();
        changeColorCount(-1);
    } else if (key === 'ArrowLeft') {
        // Left Arrow: Undo
        undo();
    } else if (key === 'ArrowRight') {
        // Right Arrow: Redo
        redo();
    }
});

function changeColorCount(delta) {
    let newCount = parseInt(colorCountInput.value) + delta;
    if (newCount >= 2 && newCount <= 20) {
        colorCountInput.value = newCount;
        colorCountInput.dispatchEvent(new Event('change'));
    }
}
