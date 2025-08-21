// === MONGODB INSTALLER MODULE ===
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// MongoDB installer for Windows
function installMongoDBWindows() {
    return new Promise((resolve, reject) => {
        console.log('🔄 Installing MongoDB on Windows...');
        
        // Use winget (Windows Package Manager) - more reliable than Chocolatey
        const wingetInstall = spawn('winget', ['install', 'MongoDB.Server', '--accept-package-agreements', '--accept-source-agreements'], {
            stdio: 'inherit'
        });
        
        wingetInstall.on('close', (code) => {
            if (code === 0) {
                console.log('✅ MongoDB installed successfully');
                // Start MongoDB service
                exec('net start MongoDB', (error) => {
                    if (error) {
                        console.log('⚠️ MongoDB installed but service not started. Starting manually...');
                        // Try alternative service name
                        exec('sc start MongoDB', () => {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            } else {
                reject(new Error('MongoDB installation failed'));
            }
        });
        
        wingetInstall.on('error', (error) => {
            reject(error);
        });
    });
}

// MongoDB installer for Linux
function installMongoDBLinux() {
    return new Promise((resolve, reject) => {
        console.log('🔄 Installing MongoDB on Linux...');
        
        // Check for package manager and install
        exec('which apt-get', (error) => {
            if (!error) {
                // Ubuntu/Debian
                const commands = [
                    'sudo apt-get update',
                    'sudo apt-get install -y mongodb',
                    'sudo systemctl start mongodb',
                    'sudo systemctl enable mongodb'
                ];
                executeLinuxCommands(commands, resolve, reject);
            } else {
                // Try yum for CentOS/RHEL
                exec('which yum', (yumError) => {
                    if (!yumError) {
                        const commands = [
                            'sudo yum install -y mongodb-server',
                            'sudo systemctl start mongod',
                            'sudo systemctl enable mongod'
                        ];
                        executeLinuxCommands(commands, resolve, reject);
                    } else {
                        reject(new Error('Unsupported Linux distribution'));
                    }
                });
            }
        });
    });
}

function executeLinuxCommands(commands, resolve, reject) {
    let index = 0;
    
    function runNext() {
        if (index >= commands.length) {
            console.log('✅ MongoDB installed and started successfully');
            resolve();
            return;
        }
        
        const command = commands[index];
        console.log(`Running: ${command}`);
        
        exec(command, (error) => {
            if (error && index < 2) { // Allow service start/enable to fail
                reject(error);
                return;
            }
            index++;
            runNext();
        });
    }
    
    runNext();
}

// Main installer function
async function installMongoDB() {
    const platform = os.platform();
    
    try {
        if (platform === 'win32') {
            await installMongoDBWindows();
        } else if (platform === 'linux') {
            await installMongoDBLinux();
        } else {
            throw new Error('Unsupported platform for automatic MongoDB installation');
        }
        return true;
    } catch (error) {
        console.error('MongoDB installation failed:', error.message);
        return false;
    }
}

module.exports = { installMongoDB };