// === APP STARTUP SCRIPT ===
const { spawn } = require('child_process');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 Starting Collector\'s Dream App...\n');

// Get bundled MongoDB path
function getBundledMongoPath() {
    const platform = os.platform();
    const isElectron = process.versions.electron;
    
    if (isElectron) {
        const resourcesPath = process.resourcesPath;
        return platform === 'win32' 
            ? path.join(resourcesPath, 'mongodb', 'bin', 'mongod.exe')
            : path.join(resourcesPath, 'mongodb', 'bin', 'mongod');
    } else {
        return platform === 'win32'
            ? path.join(__dirname, 'mongodb-binaries', 'win', 'bin', 'mongod.exe')
            : path.join(__dirname, 'mongodb-binaries', 'linux', 'bin', 'mongod');
    }
}

// === MONGODB MANAGEMENT ===
// Check if MongoDB is available and get path
function getMongoInfo() {
    return new Promise((resolve) => {
        // Check system MongoDB first
        exec('mongod --version', (error) => {
            if (!error) {
                resolve({ available: true, bundled: false, cmd: 'mongod' });
                return;
            }
            
            // Check bundled MongoDB
            const bundledPath = getBundledMongoPath();
            if (fs.existsSync(bundledPath)) {
                resolve({ available: true, bundled: true, cmd: bundledPath });
            } else {
                resolve({ available: false });
            }
        });
    });
}

// Check if MongoDB is running
function checkMongoRunning() {
    return new Promise((resolve) => {
        exec('pgrep mongod', (error, stdout) => {
            resolve(!error && stdout.trim());
        });
    });
}

// Start MongoDB if not running
function startMongoDB(mongoInfo) {
    return new Promise((resolve) => {
        console.log('🔄 Starting MongoDB...');
        const mongoProcess = spawn(mongoInfo.cmd, ['--dbpath', './data/db'], {
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
        const mongoInfo = await getMongoInfo();
        
        if (!mongoInfo.available) {
            console.log('❌ MongoDB not found. Please run "npm run setup" first.');
            process.exit(1);
        }
        
        const mongoRunning = await checkMongoRunning();
        
        if (!mongoRunning) {
            await startMongoDB(mongoInfo);
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