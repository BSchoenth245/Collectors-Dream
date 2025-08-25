// === APP STARTUP SCRIPT ===
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 Starting Collector\'s Dream App...\n');

// === MONGODB MANAGEMENT ===
// Check if MongoDB is running
function checkMongoRunning() {
    return new Promise((resolve) => {
        exec('pgrep mongod', (error, stdout) => {
            resolve(!error && stdout.trim());
        });
    });
}

// Check if MongoDB is available
function checkMongoDB() {
    return new Promise((resolve) => {
        exec('mongod --version', (error) => {
            resolve(!error);
        });
    });
}

// Start MongoDB if not running
function startMongoDB() {
    return new Promise((resolve) => {
        console.log('🔄 Starting MongoDB...');
        const dataDir = path.join(__dirname, 'data', 'db');
        
        // Ensure data directory exists
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        const mongoProcess = spawn('mongod', ['--dbpath', dataDir], {
            stdio: 'pipe',
            detached: true
        });
        
        setTimeout(() => {
            console.log('✅ MongoDB started');
            resolve();
        }, 3000);
    });
}

// === APPLICATION SERVER ===
// Start the application server
function startApp() {
    console.log('🌐 Starting application server...');
    const serverProcess = spawn('node', ['server.js'], {
        stdio: 'inherit'
    });
    
    console.log('✅ Application started at http://localhost:8000');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down...');
        serverProcess.kill();
        process.exit(0);
    });
}

// === MAIN START PROCESS ===
// Main start function
async function start() {
    try {
        const mongoAvailable = await checkMongoDB();
        
        if (!mongoAvailable) {
            console.log('❌ MongoDB not found. Please run "npm run setup" first.');
            process.exit(1);
        }
        
        const mongoRunning = await checkMongoRunning();
        
        if (!mongoRunning) {
            await startMongoDB();
        } else {
            console.log('✅ MongoDB already running');
        }
        
        startApp();
        
    } catch (error) {
        console.error('❌ Failed to start app:', error.message);
        process.exit(1);
    }
}

start();