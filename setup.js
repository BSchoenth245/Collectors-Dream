// === SETUP SCRIPT ===
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 Setting up Collector\'s Dream App...\n');

// Check if MongoDB is available
function checkMongoDB() {
    return new Promise((resolve) => {
        exec('mongod --version', (error) => {
            if (!error) {
                console.log('✅ MongoDB found');
                resolve({ found: true });
            } else {
                console.log('❌ MongoDB not found');
                resolve({ found: false });
            }
        });
    });
}

// Show MongoDB installation instructions
function showMongoDBInstructions() {
    const platform = os.platform();
    console.log('\n📋 MongoDB Installation Required\n');
    
    if (platform === 'win32') {
        console.log('🪟 Windows Installation:');
        console.log('1. Download MongoDB Community Server:');
        console.log('   https://www.mongodb.com/try/download/community');
        console.log('2. Select "Windows" and "msi" package');
        console.log('3. Run the installer with these settings:');
        console.log('   ✓ Choose "Complete" installation');
        console.log('   ✓ Check "Install MongoDB as a Service"');
        console.log('   ✓ Check "Run service as Network Service user"');
        console.log('4. After installation, restart your computer');
        console.log('5. Run "npm run setup" again\n');
    } else if (platform === 'linux') {
        console.log('🐧 Linux Installation:');
        console.log('Ubuntu/Debian:');
        console.log('  sudo apt-get update');
        console.log('  sudo apt-get install -y mongodb');
        console.log('  sudo systemctl start mongodb');
        console.log('  sudo systemctl enable mongodb\n');
        console.log('CentOS/RHEL:');
        console.log('  sudo yum install -y mongodb-server');
        console.log('  sudo systemctl start mongod');
        console.log('  sudo systemctl enable mongod\n');
    } else if (platform === 'darwin') {
        console.log('🍎 macOS Installation:');
        console.log('Using Homebrew:');
        console.log('  brew tap mongodb/brew');
        console.log('  brew install mongodb-community');
        console.log('  brew services start mongodb/brew/mongodb-community\n');
    }
    
    console.log('After installing MongoDB, run "npm run setup" again.');
    console.log('\nNeed help? Check the troubleshooting guide in README.md\n');
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
        const mongoInfo = await checkMongoDB();
        if (!mongoInfo.found) {
            console.log('❌ MongoDB is required but not found on your system.');
            showMongoDBInstructions();
            console.log('\nPlease install MongoDB and run "npm run setup" again.');
            process.exit(1);
        }

        console.log('✅ MongoDB found - proceeding with setup...');
        createDataDir();
        
        const depsInstalled = await installDependencies();
        if (!depsInstalled) {
            process.exit(1);
        }

        console.log('\n🎉 Setup complete!');
        console.log('\nTo start the app:');
        console.log('  npm start        - Start web version');
        console.log('  npm run desktop  - Start desktop version');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

setup();