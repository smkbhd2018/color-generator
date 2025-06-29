// adjustments.js

let hueOffset = 0;
let satOffset = 0;
let lightOffset = 0;

function adjustHue(h) {
    let adjusted = (h + hueOffset) % 360;
    if (adjusted < 0) adjusted += 360;
    return adjusted;
}

function adjustSat(s) {
    return clamp(s + satOffset, 0, 100);
}

function adjustLight(l) {
    return clamp(l + lightOffset, 0, 100);
}

function resetSliders() {
    hueOffset = 0;
    satOffset = 0;
    lightOffset = 0;
    hueOffsetSlider.value = 0;
    satOffsetSlider.value = 0;
    lightOffsetSlider.value = 0;
    renderPalette();
}

function applyAdjustments() {
    saveState();

    colors = colors.map(color => {
        const adjustedH = adjustHue(color.h);
        const adjustedS = adjustSat(color.s);
        const adjustedL = adjustLight(color.l);
        return {
            h: adjustedH,
            s: adjustedS,
            l: adjustedL,
            locked: color.locked
        };
    });

    hueOffset = 0;
    satOffset = 0;
    lightOffset = 0;
    hueOffsetSlider.value = 0;
    satOffsetSlider.value = 0;
    lightOffsetSlider.value = 0;

    renderPalette();
}
