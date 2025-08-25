// === DEPENDENCIES & SETUP ===
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const intPort = 8000;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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


// === COLLECTION ROUTES ===
// Get all collection items
app.get('/collection', async (req, res) => {
    try {
        // Query the collection
        const arrAllData = await Data.find();
        res.json(arrAllData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new collection item
app.post('/collection', async (req, res) => {
    try {
        const objNewData = Data(req.body)

        const objSavedData = await objNewData.save()

        res.status(201).json(objSavedData)
    } catch(err){
        res.status(400).json({message: err.message})
    
    }
})

// Delete collection item by ID
app.delete('/collection/:id', async (req, res) => {
    try {
        const strId = req.params.id;
        
        // Check if the document exists first
        const objDocument = await Data.findById(strId);
        if (!objDocument) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Delete the document
        const objDeletedData = await Data.findByIdAndDelete(strId);
        res.json({ message: "Document deleted successfully", deletedData: objDeletedData });
    } catch (error) {
        // Handle invalid ID format error
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        res.status(500).json({ message: error.message });
    }
})

// === CATEGORY ROUTES ===
const fs = require('fs');
const path = require('path');

// Get all categories from JSON file
app.get('/categories', (req, res) => {
    try {
        const strCategoriesPath = path.join(__dirname, 'categories.json');
        const objCategories = JSON.parse(fs.readFileSync(strCategoriesPath, 'utf8'));
        res.json(objCategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Save new category to JSON file
app.post('/categories', (req, res) => {
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

// Delete category from JSON file
app.delete('/categories/:key', (req, res) => {
    try {
        const strCategoriesPath = path.join(__dirname, 'categories.json');
        const objCategories = JSON.parse(fs.readFileSync(strCategoriesPath, 'utf8'));
        const { key: strKey } = req.params;
        
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

// === STATIC FILES & SERVER START ===
// Serve static files
app.use(express.static(__dirname));

// Serve main HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start server
app.listen(intPort, () => {
    console.log(`Server running on port ${intPort}`);
});