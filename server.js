const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const favoritesFilePath = path.join(__dirname, 'favorites.json');

// Ensure `favorites.json` exists, create it if not
if (!fs.existsSync(favoritesFilePath)) {
    fs.writeFileSync(favoritesFilePath, '[]', 'utf8'); // Initialize with an empty array
}

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// Endpoint to get favorites
app.get('/favorites', (req, res) => {
    fs.readFile(favoritesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading favorites.json:', err);
            res.status(500).send({ error: 'Failed to read favorites.' });
        } else {
            res.send(data || '[]'); // Send an empty array if the file is empty
        }
    });
});

// Endpoint to save favorites
app.post('/favorites', (req, res) => {
    const favorites = req.body;
    fs.writeFile(favoritesFilePath, JSON.stringify(favorites, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to favorites.json:', err);
            res.status(500).send({ error: 'Failed to save favorites.' });
        } else {
            res.send({ message: 'Favorites saved successfully.' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
