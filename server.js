// === DEPENDENCIES & SETUP ===
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const intPort = 8000;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Prevent caching of API responses
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// === DATABASE CONNECTION ===
const strMongoURI = 'mongodb://127.0.0.1:27017/CollectorDream';
mongoose.connect(strMongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// === DATABASE SCHEMA ===
const Schema = mongoose.Schema;
const dataSchema = new Schema({}, { strict: false });
const Data = mongoose.model('Data', dataSchema, 'collection');

// === API ROUTES (MUST BE BEFORE STATIC FILES) ===

// Version check endpoint
app.get('/api/version', (req, res) => {
    res.json({ version: '1.1.2', timestamp: Date.now() });
});

// Individual collection record routes (MUST BE FIRST)
app.get('/api/collection/:id', async (req, res) => {
    try {
        const strId = req.params.id;
        const objDocument = await Data.findById(strId);
        if (!objDocument) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(objDocument);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/collection/:id', async (req, res) => {
    try {
        const strId = req.params.id;
        const objUpdatedData = await Data.findByIdAndUpdate(strId, req.body, { new: true });
        if (!objUpdatedData) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(objUpdatedData);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/collection/:id', async (req, res) => {
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

// General collection routes (AFTER specific ID routes)
app.get('/api/collection', async (req, res) => {
    console.log('GET /api/collection - Loading all records');
    try {
        const arrAllData = await Data.find();
        console.log('Found', arrAllData.length, 'records');
        res.json(arrAllData);
    } catch (error) {
        console.log('Error loading collection:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/collection', async (req, res) => {
    try {
        const objNewData = Data(req.body);
        const objSavedData = await objNewData.save();
        res.status(201).json(objSavedData);
    } catch(err){
        res.status(400).json({message: err.message});
    }
});

// Category routes
app.get('/api/categories', (req, res) => {
    try {
        const strCategoriesPath = path.join(__dirname, 'categories.json');
        const objCategories = JSON.parse(fs.readFileSync(strCategoriesPath, 'utf8'));
        res.json(objCategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/categories', (req, res) => {
    try {
        const strCategoriesPath = path.join(__dirname, 'categories.json');
        const objCategories = JSON.parse(fs.readFileSync(strCategoriesPath, 'utf8'));
        const { key: strKey, category: objCategory } = req.body;
        objCategories[strKey] = objCategory;
        fs.writeFileSync(strCategoriesPath, JSON.stringify(objCategories, null, 4));
        res.json({ message: 'Category saved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/categories/:key', (req, res) => {
    try {
        const strCategoriesPath = path.join(__dirname, 'categories.json');
        const objCategories = JSON.parse(fs.readFileSync(strCategoriesPath, 'utf8'));
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
app.get('/api/settings', (req, res) => {
    try {
        const strSettingsPath = path.join(__dirname, 'settings.json');
        let objSettings = { darkMode: false };
        if (fs.existsSync(strSettingsPath)) {
            objSettings = JSON.parse(fs.readFileSync(strSettingsPath, 'utf8'));
        }
        res.json(objSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        const strSettingsPath = path.join(__dirname, 'settings.json');
        const objSettings = req.body;
        fs.writeFileSync(strSettingsPath, JSON.stringify(objSettings, null, 4));
        res.json({ message: 'Settings saved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// === STATIC FILES (AFTER ALL API ROUTES) ===
app.use(express.static(__dirname));

// === ROOT ROUTE (LAST) ===
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(intPort, () => {
    console.log(`Server running on port ${intPort}`);
});