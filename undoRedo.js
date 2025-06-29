// undoRedo.js

let undoStack = [];
let redoStack = [];

function saveState() {
    undoStack.push({
        colors: JSON.parse(JSON.stringify(colors)),
        hueOffset: hueOffset,
        satOffset: satOffset,
        lightOffset: lightOffset
    });
    redoStack = [];
}

function undo() {
    if (undoStack.length === 0) return;
    const currentState = {
        colors: JSON.parse(JSON.stringify(colors)),
        hueOffset: hueOffset,
        satOffset: satOffset,
        lightOffset: lightOffset
    };
    redoStack.push(currentState);

    const prevState = undoStack.pop();
    colors = prevState.colors;
    hueOffset = prevState.hueOffset;
    satOffset = prevState.satOffset;
    lightOffset = prevState.lightOffset;

    hueOffsetSlider.value = hueOffset;
    satOffsetSlider.value = satOffset;
    lightOffsetSlider.value = lightOffset;

    renderPalette();
}

function redo() {
    if (redoStack.length === 0) return;
    const currentState = {
        colors: JSON.parse(JSON.stringify(colors)),
        hueOffset: hueOffset,
        satOffset: satOffset,
        lightOffset: lightOffset
    };
    undoStack.push(currentState);

    const nextState = redoStack.pop();
    colors = nextState.colors;
    hueOffset = nextState.hueOffset;
    satOffset = nextState.satOffset;
    lightOffset = nextState.lightOffset;

    hueOffsetSlider.value = hueOffset;
    satOffsetSlider.value = satOffset;
    lightOffsetSlider.value = lightOffset;

    renderPalette();
}
