// script.js

document.addEventListener('DOMContentLoaded', () => {
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

    let colors = [];
    let hueOffset = 0;
    let satOffset = 0;
    let lightOffset = 0;

    let undoStack = [];
    let redoStack = [];

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

    let sortable = new Sortable(palette, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        handle: '.drag-handle',
        onEnd: function (evt) {
            const oldIndex = evt.oldIndex / 2;
            const newIndex = evt.newIndex / 2;
            if (oldIndex === newIndex) return;
            saveState();
            const movedItem = colors.splice(oldIndex, 1)[0];
            colors.splice(newIndex, 0, movedItem);
            renderPalette();
        }
    });

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
            if (index > 0) {
                const addBtn = document.createElement('div');
                addBtn.classList.add('add-button');
                addBtn.innerHTML = '+';
                addBtn.addEventListener('click', () => {
                    saveState();
                    insertColor(index);
                });
                palette.appendChild(addBtn);
            }

            const color = colors[index];

            const swatch = document.createElement('div');
            swatch.classList.add('color-swatch');
            swatch.setAttribute('data-index', index);
            swatch.style.backgroundColor = `hsl(${adjustHue(color.h, hueOffset)}, ${adjustSat(color.s, satOffset)}%, ${adjustLight(color.l, lightOffset)}%)`;

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
            });

            const codes = document.createElement('div');
            codes.classList.add('color-codes');

            const adjustedH = adjustHue(color.h, hueOffset);
            const adjustedS = adjustSat(color.s, satOffset);
            const adjustedL = adjustLight(color.l, lightOffset);
            const hex = hslToHex(adjustedH, adjustedS, adjustedL);
            const rgb = hslToRgb(adjustedH, adjustedS, adjustedL);

            codes.appendChild(createColorCodeElement(`HEX: ${hex}`, hex));
            codes.appendChild(createColorCodeElement(`HSL: hsl(${adjustedH}, ${adjustedS}%, ${adjustedL}%)`, `hsl(${adjustedH}, ${adjustedS}%, ${adjustedL}%)`));
            codes.appendChild(createColorCodeElement(`RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`));

            const colorPickerInput = document.createElement('input');
            colorPickerInput.type = 'color';
            colorPickerInput.classList.add('color-picker-input');
            colorPickerInput.value = hex;
            colorPickerInput.addEventListener('change', (e) => {
                saveState();
                const newHex = e.target.value;
                const { h, s, l } = hexToHsl(newHex);
                colors[index].h = h;
                colors[index].s = s;
                colors[index].l = l;
                renderPalette();
            });

            swatch.appendChild(dragHandle);
            swatch.appendChild(lock);
            swatch.appendChild(codes);
            swatch.appendChild(colorPickerInput);
            palette.appendChild(swatch);
        }

        const addBtnEnd = document.createElement('div');
        addBtnEnd.classList.add('add-button');
        addBtnEnd.innerHTML = '+';
        addBtnEnd.addEventListener('click', () => {
            saveState();
            insertColor(colors.length);
        });
        palette.appendChild(addBtnEnd);
    }

    function insertColor(index) {
        const algorithm = algorithmSelect.value;
        const baseHue = colors.length > 0 ? colors[0].h : Math.floor(Math.random() * 360);
        colors.splice(index, 0, generateColor(false, algorithm, colors.length + 1, baseHue, index));
        const newCount = colors.length;
        colorCountInput.value = newCount;
        renderPalette();
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
            const adjustedH = adjustHue(color.h, hueOffset);
            const adjustedS = adjustSat(color.s, satOffset);
            const adjustedL = adjustLight(color.l, lightOffset);
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

    adjustPaletteSize();
    saveState();
});
