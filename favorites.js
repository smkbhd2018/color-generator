// favorites.js

let favoritesData = [];

// DOM Elements
const savePaletteBtn = document.getElementById('savePaletteBtn');
const viewFavoritesBtn = document.getElementById('viewFavoritesBtn');
const favoritesModal = document.getElementById('favoritesModal');
const favoritesList = document.getElementById('favoritesList');
const closeModalBtn = favoritesModal.querySelector('.close');

// Event Listeners
savePaletteBtn.addEventListener('click', savePaletteToFavorites);
viewFavoritesBtn.addEventListener('click', openFavoritesModal);
closeModalBtn.addEventListener('click', closeFavoritesModal);

window.addEventListener('click', (event) => {
    if (event.target == favoritesModal) {
        closeFavoritesModal();
    }
});

// Load favorites from server
async function loadFavorites() {
    try {
        const response = await fetch('/favorites');
        favoritesData = await response.json();
    } catch (err) {
        console.error('Failed to load favorites:', err);
        favoritesData = [];
    }
}

// Save favorites to server
async function saveFavorites() {
    try {
        await fetch('/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(favoritesData),
        });
    } catch (err) {
        console.error('Failed to save favorites:', err);
    }
}

async function savePaletteToFavorites() {
    const paletteName = prompt('Enter a name for this palette:');
    if (!paletteName) return;

    const paletteData = {
        name: paletteName,
        colors: colors.map(color => ({
            h: color.h,
            s: color.s,
            l: color.l,
            locked: color.locked
        }))
    };

    favoritesData.push(paletteData);
    await saveFavorites();
    alert('Palette saved to favorites!');
}

function openFavoritesModal() {
    favoritesModal.style.display = 'block';
    renderFavorites();
}

function closeFavoritesModal() {
    favoritesModal.style.display = 'none';
}

function renderFavorites() {
    favoritesList.innerHTML = '';
    if (favoritesData.length === 0) {
        favoritesList.innerHTML = '<p>No favorites saved.</p>';
        return;
    }

    favoritesData.forEach((paletteData, index) => {
        const favoriteItem = document.createElement('div');
        favoriteItem.classList.add('favorite-item');

        const title = document.createElement('h3');
        title.textContent = paletteData.name;

        const favoritePalette = document.createElement('div');
        favoritePalette.classList.add('favorite-palette');

        paletteData.colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.classList.add('favorite-swatch');
            swatch.style.backgroundColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
            favoritePalette.appendChild(swatch);
        });

        const actions = document.createElement('div');
        actions.classList.add('favorite-actions');

        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Load Palette';
        loadBtn.addEventListener('click', () => {
            loadPalette(paletteData);
            closeFavoritesModal();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', async () => {
            favoritesData.splice(index, 1);
            await saveFavorites();
            renderFavorites();
        });

        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);

        favoriteItem.appendChild(title);
        favoriteItem.appendChild(favoritePalette);
        favoriteItem.appendChild(actions);

        favoritesList.appendChild(favoriteItem);
    });
}

function loadPalette(paletteData) {
    saveState();
    colors = paletteData.colors.map(color => ({
        h: color.h,
        s: color.s,
        l: color.l,
        locked: color.locked
    }));
    colorCountInput.value = colors.length;
    renderPalette();
}

// Load favorites on app startup
loadFavorites();
