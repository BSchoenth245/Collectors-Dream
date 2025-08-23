// === POST-INSTALL SCRIPT ===
// This runs after the application is installed to set up dependencies

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Finalizing Collector\'s Dream installation...\n');

// Create MongoDB data directory
function createDataDir() {
    const dataDir = path.join(__dirname, 'data', 'db');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('✅ Created MongoDB data directory');
    }
}

// Install npm dependencies
function installDependencies() {
    return new Promise((resolve) => {
        console.log('📦 Installing dependencies...');
        const npmProcess = spawn('npm', ['install', '--production'], {
            stdio: 'inherit',
            cwd: __dirname
        });
        
        npmProcess.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Dependencies installed successfully');
                resolve(true);
            } else {
                console.log('❌ Failed to install dependencies');
                resolve(false);
            }
        });
    });
}

// Main setup process
async function postInstall() {
    try {
        createDataDir();
        
        const depsInstalled = await installDependencies();
        if (!depsInstalled) {
            console.log('⚠️  Some dependencies failed to install. The app may not work correctly.');
        }

        console.log('\n🎉 Installation complete!');
        console.log('\nCollector\'s Dream is ready to use.');
        console.log('The application will check for MongoDB when you first launch it.');
        
    } catch (error) {
        console.error('❌ Post-install setup failed:', error.message);
    }
}

postInstall();