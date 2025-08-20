// === SETUP SCRIPT ===
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Collector\'s Dream App...\n');

// === MONGODB SETUP ===
// Check if MongoDB is installed
function checkMongoDB() {
    return new Promise((resolve) => {
        exec('mongod --version', (error) => {
            if (error) {
                console.log('❌ MongoDB not found. Please install MongoDB first.');
                console.log('   Visit: https://www.mongodb.com/try/download/community');
                resolve(false);
            } else {
                console.log('✅ MongoDB found');
                resolve(true);
            }
        });
    });
}

// Start MongoDB service
function startMongoDB() {
    return new Promise((resolve) => {
        console.log('🔄 Starting MongoDB service...');
        const mongoProcess = spawn('mongod', ['--dbpath', './data/db'], {
            stdio: 'pipe'
        });
        
        setTimeout(() => {
            console.log('✅ MongoDB service started');
            resolve(mongoProcess);
        }, 3000);
    });
}

// Create MongoDB data directory
function createDataDir() {
    const dataDir = path.join(__dirname, 'data', 'db');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('✅ Created MongoDB data directory');
    }
}

// === DEPENDENCY INSTALLATION ===
// Install npm dependencies
function installDependencies() {
    return new Promise((resolve) => {
        console.log('📦 Installing dependencies...');
        const npmProcess = spawn('npm', ['install'], {
            stdio: 'inherit'
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

// === MAIN SETUP PROCESS ===
// Run complete setup process
async function setup() {
    try {
        const mongoInstalled = await checkMongoDB();
        if (!mongoInstalled) {
            process.exit(1);
        }

        createDataDir();
        
        const depsInstalled = await installDependencies();
        if (!depsInstalled) {
            process.exit(1);
        }

        console.log('\n🎉 Setup complete!');
        console.log('\nTo start the app:');
        console.log('  npm start        - Start web version');
        console.log('  npm run desktop  - Start desktop version');
        console.log('\nMake sure MongoDB is running before starting the app.');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

setup();