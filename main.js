// === ELECTRON MAIN PROCESS ===
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const AppUpdater = require('./updater');
const MongoInstaller = require('./mongo-installer');

let mainWindow;
let wizardWindow;
let server;
const installer = new MongoInstaller();

// Create MongoDB setup wizard
function createWizard() {
    wizardWindow = new BrowserWindow({
        width: 600,
        height: 500,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'assets', 'colored-logo.png')
    });

    wizardWindow.loadFile('mongo-wizard.html');
    
    wizardWindow.on('closed', () => {
        wizardWindow = null;
    });
}

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

// Check if this is first run
function isFirstRun() {
    const configPath = path.join(__dirname, 'data', 'config.json');
    return !fs.existsSync(configPath);
}

// Mark as configured
function markConfigured() {
    const dataDir = path.join(__dirname, 'data');
    const configPath = path.join(dataDir, 'config.json');
    
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify({ configured: true, timestamp: Date.now() }));
}

// === EMBEDDED SERVER ===
// Start Express server within Electron
function startServer() {
    // Import and start the server directly
    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');
    const fs = require('fs');
    
    const expressApp = express();
    const port = 8000;
    
    // Middleware
    expressApp.use(cors());
    expressApp.use(express.json());
    
    const mongoURI = 'mongodb://127.0.0.1:27017/CollectorDream';
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch(err => console.log('MongoDB connection error:', err));
    
    // === DATABASE SCHEMA ===
    const Schema = mongoose.Schema;
    const dataSchema = new Schema({}, { strict: false });
    const Data = mongoose.model('Data', dataSchema, 'collection');
    
    // === API ROUTES ===
    expressApp.get('/collection', async (req, res) => {
        try {
            const allData = await Data.find();
            res.json(allData);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
    
    expressApp.post('/collection', async (req, res) => {
        try {
            const newData = Data(req.body);
            const savedData = await newData.save();
            res.status(201).json(savedData);
        } catch(err){
            res.status(400).json({message: err.message});
        }
    });
    
    expressApp.delete('/collection/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const document = await Data.findById(id);
            if (!document) {
                return res.status(404).json({ message: "Document not found" });
            }
            const deletedData = await Data.findByIdAndDelete(id);
            res.json({ message: "Document deleted successfully", deletedData });
        } catch (error) {
            if (error.name === 'CastError') {
                return res.status(400).json({ message: "Invalid ID format" });
            }
            res.status(500).json({ message: error.message });
        }
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
    
    // Serve static files
    expressApp.use(express.static(__dirname));
    
    expressApp.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
    
    server = expressApp.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

// === IPC HANDLERS ===
ipcMain.on('check-mongodb', async (event) => {
    const result = await installer.checkMongoDB();
    event.reply('mongodb-status', result);
});

ipcMain.on('install-mongodb', async (event) => {
    const result = await installer.installMongoDB((progress) => {
        event.reply('install-progress', progress);
    });
    event.reply('install-result', result);
});

ipcMain.on('skip-mongodb', (event) => {
    markConfigured();
    if (wizardWindow) {
        wizardWindow.close();
    }
    createWindow();
});

ipcMain.on('continue-to-app', (event) => {
    markConfigured();
    if (wizardWindow) {
        wizardWindow.close();
    }
    createWindow();
});

// === ELECTRON APP LIFECYCLE ===
app.whenReady().then(async () => {
    if (isFirstRun()) {
        createWizard();
    } else {
        createWindow();
    }
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