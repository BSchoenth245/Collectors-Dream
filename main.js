// === ELECTRON MAIN PROCESS ===
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const AppUpdater = require('./updater');
const MongoInstaller = require('./mongo-installer');

let objMainWindow;
let objWizardWindow;
let objServer;
const objInstaller = new MongoInstaller();

// Create MongoDB setup wizard
function createWizard() {
    objWizardWindow = new BrowserWindow({
        width: 600,
        height: 500,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'assets', 'colored-logo.png')
    });

    objWizardWindow.loadFile('mongo-wizard.html');
    
    objWizardWindow.on('closed', () => {
        objWizardWindow = null;
    });
}

// Create main application window
function createWindow() {
    objMainWindow = new BrowserWindow({
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
        objMainWindow.loadURL('http://localhost:8000');
    }, 2000);

    objMainWindow.on('closed', () => {
        objMainWindow = null;
        if (objServer) {
            objServer.close();
        }
    });
}

// Get user data directory
function getUserDataDir() {
    return app.getPath('userData');
}

// Check if this is first run
function isFirstRun() {
    const strConfigPath = path.join(getUserDataDir(), 'config.json');
    return !fs.existsSync(strConfigPath);
}

// Mark as configured
function markConfigured() {
    const strDataDir = getUserDataDir();
    const strConfigPath = path.join(strDataDir, 'config.json');
    
    if (!fs.existsSync(strDataDir)) {
        fs.mkdirSync(strDataDir, { recursive: true });
    }
    
    fs.writeFileSync(strConfigPath, JSON.stringify({ configured: true, timestamp: Date.now() }));
}

// === EMBEDDED SERVER ===
// Start Express server within Electron
function startServer() {
    // Import and start the server directly
    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');
    const fs = require('fs');
    
    const objExpressApp = express();
    const intPort = 8000;
    
    // Middleware
    objExpressApp.use(cors());
    objExpressApp.use(express.json({ limit: '10mb' }));
    objExpressApp.use(express.urlencoded({ limit: '10mb', extended: true }));
    
    const strMongoURI = 'mongodb://127.0.0.1:27017/CollectorDream';
    mongoose.connect(strMongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch(err => console.log('MongoDB connection error:', err));
    
    // === DATABASE SCHEMA ===
    const Schema = mongoose.Schema;
    const dataSchema = new Schema({}, { strict: false });
    const Data = mongoose.model('Data', dataSchema, 'collection');
    
    // === API ROUTES ===
    objExpressApp.get('/api/collection', async (req, res) => {
        try {
            const arrAllData = await Data.find();
            res.json(arrAllData);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
    
    objExpressApp.post('/api/collection', async (req, res) => {
        try {
            const objNewData = Data(req.body);
            const objSavedData = await objNewData.save();
            res.status(201).json(objSavedData);
        } catch(err){
            res.status(400).json({message: err.message});
        }
    });
    
    objExpressApp.delete('/api/collection/:id', async (req, res) => {
        try {
            const strId = req.params.id;
            const objDocument = await Data.findById(strId);
            if (!objDocument) {
                return res.status(404).json({ message: "Document not found" });
            }
            const objDeletedData = await Data.findByIdAndDelete(strId);
            res.json({ message: "Document deleted successfully", deletedData: objDeletedData });
        } catch (error) {
            if (error.name === 'CastError') {
                return res.status(400).json({ message: "Invalid ID format" });
            }
            res.status(500).json({ message: error.message });
        }
    });
    
    objExpressApp.get('/api/categories', (req, res) => {
        try {
            const strCategoriesPath = path.join(getUserDataDir(), 'categories.json');
            let objCategories = {};
            if (fs.existsSync(strCategoriesPath)) {
                objCategories = JSON.parse(fs.readFileSync(strCategoriesPath, 'utf8'));
            }
            res.json(objCategories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
    
    objExpressApp.post('/api/categories', (req, res) => {
        try {
            const strCategoriesPath = path.join(getUserDataDir(), 'categories.json');
            let objCategories = {};
            if (fs.existsSync(strCategoriesPath)) {
                objCategories = JSON.parse(fs.readFileSync(strCategoriesPath, 'utf8'));
            }
            const { key: strKey, category: objCategory } = req.body;
            objCategories[strKey] = objCategory;
            fs.writeFileSync(strCategoriesPath, JSON.stringify(objCategories, null, 4));
            res.json({ message: 'Category saved successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
    
    objExpressApp.delete('/api/categories/:key', (req, res) => {
        try {
            const strCategoriesPath = path.join(getUserDataDir(), 'categories.json');
            let objCategories = {};
            if (fs.existsSync(strCategoriesPath)) {
                objCategories = JSON.parse(fs.readFileSync(strCategoriesPath, 'utf8'));
            }
            const strKey = req.params.key;
            if (!objCategories[strKey]) {
                return res.status(404).json({ message: 'Category not found' });
            }
            delete objCategories[strKey];
            fs.writeFileSync(strCategoriesPath, JSON.stringify(objCategories, null, 4));
            res.json({ message: 'Category deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
    
    // Settings routes
    objExpressApp.get('/api/settings', (req, res) => {
        try {
            const strSettingsPath = path.join(getUserDataDir(), 'settings.json');
            let objSettings = { darkMode: false };
            if (fs.existsSync(strSettingsPath)) {
                objSettings = JSON.parse(fs.readFileSync(strSettingsPath, 'utf8'));
            }
            res.json(objSettings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
    
    objExpressApp.post('/api/settings', (req, res) => {
        try {
            const strSettingsPath = path.join(getUserDataDir(), 'settings.json');
            const objSettings = req.body;
            fs.writeFileSync(strSettingsPath, JSON.stringify(objSettings, null, 4));
            res.json({ message: 'Settings saved successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
    
    // Serve static files
    objExpressApp.use(express.static(__dirname));
    
    objExpressApp.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
    
    objServer = objExpressApp.listen(intPort, () => {
        console.log(`Server running on port ${intPort}`);
    });
}

// === IPC HANDLERS ===
ipcMain.on('check-mongodb', async (event) => {
    const objResult = await objInstaller.checkMongoDB();
    event.reply('mongodb-status', objResult);
});

ipcMain.on('install-mongodb', async (event) => {
    const objResult = await objInstaller.installMongoDB((objProgress) => {
        event.reply('install-progress', objProgress);
    });
    event.reply('install-result', objResult);
});

ipcMain.on('skip-mongodb', (event) => {
    markConfigured();
    if (objWizardWindow) {
        objWizardWindow.close();
    }
    createWindow();
});

ipcMain.on('continue-to-app', (event) => {
    markConfigured();
    if (objWizardWindow) {
        objWizardWindow.close();
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
    if (objServer) {
        objServer.close();
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