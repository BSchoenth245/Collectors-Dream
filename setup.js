// === SETUP SCRIPT ===
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

console.log('🚀 Setting up Collector\'s Dream App...\n');

// === MONGODB SETUP ===
// Check if MongoDB is installed
function checkMongoDB() {
    return new Promise((resolve) => {
        exec('mongod --version', (error) => {
            if (error) {
                console.log('❌ MongoDB not found.');
                resolve(false);
            } else {
                console.log('✅ MongoDB found');
                resolve(true);
            }
        });
    });
}

// Install MongoDB automatically
function installMongoDB() {
    return new Promise(async (resolve) => {
        const platform = os.platform();
        console.log('📥 Installing MongoDB...');
        
        try {
            if (platform === 'win32') {
                await installMongoDBWindows();
            } else if (platform === 'linux') {
                await installMongoDBLinux();
            } else {
                console.log('❌ Automatic MongoDB installation not supported on this platform.');
                console.log('   Please install MongoDB manually: https://www.mongodb.com/try/download/community');
                resolve(false);
                return;
            }
            resolve(true);
        } catch (error) {
            console.log('❌ MongoDB installation failed:', error.message);
            console.log('   Please install MongoDB manually: https://www.mongodb.com/try/download/community');
            resolve(false);
        }
    });
}

// Install MongoDB on Windows using Chocolatey
function installMongoDBWindows() {
    return new Promise((resolve, reject) => {
        console.log('🔄 Installing MongoDB on Windows using Chocolatey...');
        
        // First check if Chocolatey is installed
        exec('choco --version', (error) => {
            if (error) {
                console.log('📦 Installing Chocolatey first...');
                const chocoInstall = spawn('powershell', [
                    '-Command',
                    'Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString(\'https://community.chocolatey.org/install.ps1\'))'
                ], { stdio: 'inherit' });
                
                chocoInstall.on('close', (code) => {
                    if (code === 0) {
                        installMongoWithChoco(resolve, reject);
                    } else {
                        reject(new Error('Failed to install Chocolatey'));
                    }
                });
            } else {
                installMongoWithChoco(resolve, reject);
            }
        });
    });
}

function installMongoWithChoco(resolve, reject) {
    console.log('📦 Installing MongoDB with Chocolatey...');
    const mongoInstall = spawn('choco', ['install', 'mongodb', '-y'], { stdio: 'inherit' });
    
    mongoInstall.on('close', (code) => {
        if (code === 0) {
            console.log('✅ MongoDB installed successfully');
            // Start MongoDB service
            exec('net start MongoDB', (error) => {
                if (error) {
                    console.log('⚠️  MongoDB installed but service not started. You may need to start it manually.');
                }
                resolve();
            });
        } else {
            reject(new Error('Failed to install MongoDB'));
        }
    });
}

// Install MongoDB on Linux
function installMongoDBLinux() {
    return new Promise((resolve, reject) => {
        console.log('🔄 Installing MongoDB on Linux...');
        
        // Check if apt is available (Ubuntu/Debian)
        exec('which apt-get', (error) => {
            if (!error) {
                installMongoDBUbuntu(resolve, reject);
            } else {
                // Check if yum is available (CentOS/RHEL)
                exec('which yum', (yumError) => {
                    if (!yumError) {
                        installMongoDBCentOS(resolve, reject);
                    } else {
                        reject(new Error('Unsupported Linux distribution. Please install MongoDB manually.'));
                    }
                });
            }
        });
    });
}

function installMongoDBUbuntu(resolve, reject) {
    const commands = [
        'wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -',
        'echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list',
        'sudo apt-get update',
        'sudo apt-get install -y mongodb-org',
        'sudo systemctl start mongod',
        'sudo systemctl enable mongod'
    ];
    
    executeCommands(commands, resolve, reject);
}

function installMongoDBCentOS(resolve, reject) {
    const repoContent = `[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc`;
    
    fs.writeFileSync('/tmp/mongodb-org-7.0.repo', repoContent);
    
    const commands = [
        'sudo cp /tmp/mongodb-org-7.0.repo /etc/yum.repos.d/',
        'sudo yum install -y mongodb-org',
        'sudo systemctl start mongod',
        'sudo systemctl enable mongod'
    ];
    
    executeCommands(commands, resolve, reject);
}

function executeCommands(commands, resolve, reject) {
    let index = 0;
    
    function runNext() {
        if (index >= commands.length) {
            console.log('✅ MongoDB installed and started successfully');
            resolve();
            return;
        }
        
        const command = commands[index];
        console.log(`Running: ${command}`);
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`Error: ${error.message}`);
                reject(error);
                return;
            }
            index++;
            runNext();
        });
    }
    
    runNext();
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
        let mongoInstalled = await checkMongoDB();
        if (!mongoInstalled) {
            console.log('🔄 Attempting to install MongoDB automatically...');
            mongoInstalled = await installMongoDB();
            if (!mongoInstalled) {
                process.exit(1);
            }
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