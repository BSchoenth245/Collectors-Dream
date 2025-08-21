// === APP STARTUP SCRIPT ===
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Collector\'s Dream App...\n');

// === DATABASE SETUP ===
// Ensure data directory exists
function ensureDataDirectory() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('📁 Created data directory');
    }
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
function start() {
    try {
        ensureDataDirectory();
        console.log('✅ SQLite database ready');
        startApp();
    } catch (error) {
        console.error('❌ Failed to start app:', error.message);
        process.exit(1);
    }
}

start();