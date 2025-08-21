// === ELECTRON MAIN PROCESS ===
const { app, BrowserWindow } = require('electron');
const path = require('path');
const AppUpdater = require('./updater');

let mainWindow;
let server;

// Create main application window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, 'assets', 'colored-logo.png')
    });

    // Start the Express server
    startServer();

    // Load the app
    setTimeout(() => {
        mainWindow.loadURL('http://localhost:8000');
    }, 2000);

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (server) {
            server.close();
        }
    });
}

// === EMBEDDED SERVER ===
// Start Express server within Electron
function startServer() {
    const express = require('express');
    const sqlite3 = require('sqlite3').verbose();
    const cors = require('cors');
    const fs = require('fs');
    
    const expressApp = express();
    const port = 8000;
    
    // Middleware
    expressApp.use(cors());
    expressApp.use(express.json());
    
    // === DATABASE CONNECTION ===
    const dbPath = path.join(__dirname, 'data', 'collectors.db');
    
    // Ensure data directory exists
    if (!fs.existsSync(path.dirname(dbPath))) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('SQLite connection error:', err.message);
        } else {
            console.log('SQLite connected successfully');
            db.run(`CREATE TABLE IF NOT EXISTS collection (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data TEXT NOT NULL
            )`);
        }
    });
    
    // === API ROUTES ===
    expressApp.get('/collection', (req, res) => {
        db.all('SELECT * FROM collection', [], (err, rows) => {
            if (err) {
                res.status(500).json({ message: err.message });
            } else {
                const data = rows.map(row => ({ id: row.id, ...JSON.parse(row.data) }));
                res.json(data);
            }
        });
    });
    
    expressApp.post('/collection', (req, res) => {
        const dataString = JSON.stringify(req.body);
        db.run('INSERT INTO collection (data) VALUES (?)', [dataString], function(err) {
            if (err) {
                res.status(400).json({ message: err.message });
            } else {
                res.status(201).json({ id: this.lastID, ...req.body });
            }
        });
    });
    
    expressApp.delete('/collection/:id', (req, res) => {
        const id = req.params.id;
        db.run('DELETE FROM collection WHERE id = ?', [id], function(err) {
            if (err) {
                res.status(500).json({ message: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ message: 'Document not found' });
            } else {
                res.json({ message: 'Document deleted successfully' });
            }
        });
    });
    
    expressApp.get('/categories', (req, res) => {
        try {
            const categoriesPath = path.join(__dirname, 'categories.json');
            const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
    
    expressApp.post('/categories', (req, res) => {
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
    
    expressApp.delete('/categories/:key', (req, res) => {
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
    
    // Serve static files
    expressApp.use(express.static(__dirname));
    
    expressApp.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
    
    server = expressApp.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

// === ELECTRON APP LIFECYCLE ===
app.whenReady().then(() => {
    createWindow();
    new AppUpdater();
});

// Handle app quit when all windows closed
app.on('window-all-closed', () => {
    if (server) {
        server.close();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle app activation (macOS)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});