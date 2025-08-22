// === DEPENDENCIES & SETUP ===
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8000;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());

// === DATABASE CONNECTION ===
const dbPath = path.join(__dirname, 'data', 'collectors.db');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);
console.log('SQLite connected successfully');
db.exec(`CREATE TABLE IF NOT EXISTS collection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL
)`);


// === COLLECTION ROUTES ===
// Get all collection items
app.get('/collection', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM collection').all();
        const data = rows.map(row => ({ id: row.id, ...JSON.parse(row.data) }));
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new collection item
app.post('/collection', (req, res) => {
    try {
        const dataString = JSON.stringify(req.body);
        const result = db.prepare('INSERT INTO collection (data) VALUES (?)').run(dataString);
        res.status(201).json({ id: result.lastInsertRowid, ...req.body });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete collection item by ID
app.delete('/collection/:id', (req, res) => {
    try {
        const id = req.params.id;
        const result = db.prepare('DELETE FROM collection WHERE id = ?').run(id);
        if (result.changes === 0) {
            res.status(404).json({ message: 'Document not found' });
        } else {
            res.json({ message: 'Document deleted successfully' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// === CATEGORY ROUTES ===

// Get all categories from JSON file
app.get('/categories', (req, res) => {
    try {
        const categoriesPath = path.join(__dirname, 'categories.json');
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Save new category to JSON file
app.post('/categories', (req, res) => {
    try {
        const categoriesPath = path.join(__dirname, 'categories.json');
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        
        const { key, category } = req.body;
        categories[key] = category;
        
        fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 4));
        res.json({ message: 'Category saved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete category from JSON file
app.delete('/categories/:key', (req, res) => {
    try {
        const categoriesPath = path.join(__dirname, 'categories.json');
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        const { key } = req.params;
        
        if (!categories[key]) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        delete categories[key];
        fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 4));
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// === STATIC FILES & SERVER START ===
// Serve static files
app.use(express.static(__dirname));

// Serve main HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});