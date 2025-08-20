// === DEPENDENCIES & SETUP ===
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 8000;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());

// === DATABASE CONNECTION ===
const mongoURI = 'mongodb://127.0.0.1:27017/CollectorDream';
mongoose.connect(mongoURI, {
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
        const allData = await Data.find();
        res.json(allData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new collection item
app.post('/collection', async (req, res) => {
    try {
        const newData = Data(req.body)

        const savedData = await newData.save()

        res.status(201).json(savedData)
    } catch(err){
        res.status(400).json({message: err.message})
    
    }
})

// Delete collection item by ID
app.delete('/collection/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        // Check if the document exists first
        const document = await Data.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Delete the document
        const deletedData = await Data.findByIdAndDelete(id);
        res.json({ message: "Document deleted successfully", deletedData });
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