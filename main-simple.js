// === SIMPLE LAUNCHER ===
const { spawn } = require('child_process');
const { exec } = require('child_process');

console.log('🚀 Starting Collector\'s Dream...');

// Start the server
const path = require('path');
const serverProcess = spawn('node', [path.join(__dirname, 'start-app.js')], {
    stdio: 'inherit'
});

// Wait a moment then open browser
setTimeout(() => {
    console.log('🌐 Opening browser...');
    const command = process.platform === 'win32' ? 'start' : 
                   process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${command} http://localhost:8000`);
}, 3000);

// Handle shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    serverProcess.kill();
    process.exit(0);
});