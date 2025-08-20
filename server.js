// MongoDB connection setup
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb://127.0.0.1:27017/CollectorDream';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Define a basic schema - modify according to your data structure
const Schema = mongoose.Schema;
const dataSchema = new Schema({}, { strict: false });
const Data = mongoose.model('Data', dataSchema, 'collection');


app.get('/collection', async (req, res) => {
    try {
        // Query the collection
        const allData = await Data.find();
        res.json(allData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/collection', async (req, res) => {
    try {
        const newData = Data(req.body)

        const savedData = await newData.save()

        res.status(201).json(savedData)
    } catch(err){
        res.status(400).json({message: err.message})
    
    }
})

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

// Categories endpoints
const fs = require('fs');
const path = require('path');

app.get('/categories', (req, res) => {
    try {
        const categoriesPath = path.join(__dirname, 'categories.json');
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

// Serve static files
app.use(express.static(__dirname));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});