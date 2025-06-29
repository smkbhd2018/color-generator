// palette.js

let colors = [];
let colorIdCounter = 0;

function adjustPaletteSize() {
    let count = parseInt(colorCountInput.value) || 5;
    if (count < 2) count = 2;
    if (count > 20) count = 20;
    colorCountInput.value = count;
    while (colors.length < count) {
        colors.push(generateColor(false));
    }
    while (colors.length > count) {
        colors.pop();
    }
    renderPalette();
}

function generatePalette() {
    const count = parseInt(colorCountInput.value) || 5;
    const algorithm = algorithmSelect.value;
    const lockedColors = colors.filter(color => color.locked);
    const lockedCount = lockedColors.length;

    if (lockedCount > count) {
        alert('Number of locked colors exceeds the selected palette size.');
        return;
    }

    let newColors = [];
    let baseHue = Math.floor(Math.random() * 360);

    for (let i = 0; i < count; i++) {
        if (colors[i] && colors[i].locked) {
            newColors[i] = colors[i];
        } else {
            newColors[i] = generateColor(false, algorithm, count, baseHue, i);
        }
    }

    colors = newColors.slice(0, count);
    renderPalette();
}

function renderPalette() {
    palette.innerHTML = '';
    const count = colors.length;

    for (let index = 0; index < count; index++) {
        // Create the swatch
        const color = colors[index];

        const swatch = document.createElement('div');
        swatch.classList.add('color-swatch');
        swatch.setAttribute('data-index', index);
        swatch.setAttribute('data-id', color.id);
        swatch.style.backgroundColor = `hsl(${adjustHue(color.h)}, ${adjustSat(color.s)}%, ${adjustLight(color.l)}%)`;

        // Add 'locked' class if the color is locked
        if (color.locked) {
            swatch.classList.add('locked');
        }

        // Create Hex Code Text Element
        const hexCodeText = document.createElement('div');
        hexCodeText.classList.add('hex-code-text');
        const adjustedH = adjustHue(color.h);
        const adjustedS = adjustSat(color.s);
        const adjustedL = adjustLight(color.l);
        const hex = hslToHex(adjustedH, adjustedS, adjustedL).substring(1).toUpperCase();
        hexCodeText.textContent = hex;

        const dragHandle = document.createElement('div');
        dragHandle.classList.add('drag-handle');
        dragHandle.innerHTML = '☰';

        const lock = document.createElement('div');
        lock.classList.add('lock-icon');
        lock.innerHTML = color.locked ? '🔒' : '🔓';
        lock.addEventListener('click', (e) => {
            e.stopPropagation();
            saveState();
            color.locked = !color.locked;
            lock.innerHTML = color.locked ? '🔒' : '🔓';
            if (color.locked) {
                swatch.classList.add('locked');
            } else {
                swatch.classList.remove('locked');
            }
        });

        // Remove Button
        const removeBtn = document.createElement('div');
        removeBtn.classList.add('remove-icon');
        removeBtn.innerHTML = '✖';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            saveState();
            colors.splice(index, 1);
            colorCountInput.value = colors.length;
            renderPalette();
        });

        const codes = document.createElement('div');
        codes.classList.add('color-codes');

        const rgb = hslToRgb(adjustedH, adjustedS, adjustedL);

        codes.appendChild(createColorCodeElement(`HEX: ${hex}`, hex));
        codes.appendChild(createColorCodeElement(`HSL: hsl(${adjustedH}, ${adjustedS}%, ${adjustedL}%)`, `hsl(${adjustedH}, ${adjustedS}%, ${adjustedL}%)`));
        codes.appendChild(createColorCodeElement(`RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`));

        const colorPickerInput = document.createElement('input');
        colorPickerInput.type = 'color';
        colorPickerInput.classList.add('color-picker-input');
        colorPickerInput.value = hslToHex(adjustedH, adjustedS, adjustedL);
        colorPickerInput.addEventListener('change', (e) => {
            saveState();
            const newHex = e.target.value;
            const { h, s, l } = hexToHsl(newHex);
            colors[index].h = h;
            colors[index].s = s;
            colors[index].l = l;
            renderPalette();
        });

        swatch.appendChild(hexCodeText);
        swatch.appendChild(dragHandle);
        swatch.appendChild(lock);
        swatch.appendChild(removeBtn);
        swatch.appendChild(codes);
        swatch.appendChild(colorPickerInput);
        palette.appendChild(swatch);

        // Add-button between swatches
        if (index < count - 1) {
            const addBtnContainer = document.createElement('div');
            addBtnContainer.classList.add('add-button-container');

            const addBtn = document.createElement('div');
            addBtn.classList.add('add-button');
            addBtn.innerHTML = '+';
            addBtn.addEventListener('click', () => {
                saveState();
                insertColor(index + 1);
            });

            addBtnContainer.appendChild(addBtn);
            palette.appendChild(addBtnContainer);
        }
    }

    // Add-button at the end
    const addBtnEndContainer = document.createElement('div');
    addBtnEndContainer.classList.add('add-button-container');

    const addBtnEnd = document.createElement('div');
    addBtnEnd.classList.add('add-button');
    addBtnEnd.innerHTML = '+';
    addBtnEnd.addEventListener('click', () => {
        saveState();
        insertColor(colors.length);
    });

    addBtnEndContainer.appendChild(addBtnEnd);
    palette.appendChild(addBtnEndContainer);
}

function createColorCodeElement(label, value) {
    const code = document.createElement('div');
    code.classList.add('color-code');
    code.textContent = label;

    const copyBtn = document.createElement('button');
    copyBtn.classList.add('copy-btn');
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 1000);
        });
    });

    code.appendChild(copyBtn);
    return code;
}

function insertColor(index) {
    const algorithm = algorithmSelect.value;
    const baseHue = colors.length > 0 ? colors[0].h : Math.floor(Math.random() * 360);
    colors.splice(index, 0, generateColor(false, algorithm, colors.length + 1, baseHue, index));
    const newCount = colors.length;
    colorCountInput.value = newCount;
    renderPalette();
}

function generateColor(locked, algorithm = 'random', total = 5, baseHue = 0, index = 0) {
    let hue, saturation, lightness;

    switch (algorithm) {
        case 'analogous':
            hue = (baseHue + (index * 30)) % 360;
            break;
        case 'complementary':
            hue = (baseHue + (index % 2 === 0 ? 0 : 180)) % 360;
            break;
        case 'triadic':
            hue = (baseHue + (index * 120)) % 360;
            break;
        case 'tetradic':
            hue = (baseHue + (index * 90)) % 360;
            break;
        default:
            hue = Math.floor(Math.random() * 360);
    }

    saturation = clamp(50 + getRandomInt(-20, 20), 30, 80);
    lightness = clamp(50 + getRandomInt(-20, 20), 30, 80);

    return { id: colorIdCounter++, h: hue, s: saturation, l: lightness, locked: locked };
}

function unlockAllColors() {
    colors.forEach(color => color.locked = false);
    renderPalette();
}

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

// Initialize SortableJS for drag-and-drop
let sortable = new Sortable(palette, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    handle: '.drag-handle',
    draggable: '.color-swatch',
    onEnd: function (evt) {
        // Rebuild the colors array based on the new order of swatches
        const newColorsOrder = [];
        const swatches = palette.querySelectorAll('.color-swatch');
        swatches.forEach(swatch => {
            const id = parseInt(swatch.getAttribute('data-id'));
            const color = colors.find(c => c.id === id);
            if (color) {
                newColorsOrder.push(color);
            }
        });
        colors = newColorsOrder;
        renderPalette();
    }
});
