// === MONGODB INSTALLER MODULE ===
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

class MongoInstaller {
    constructor() {
        this.platform = os.platform();
        this.arch = os.arch();
    }

    // Check if MongoDB is installed
    checkMongoDB() {
        return new Promise((resolve) => {
            exec('mongod --version', (error, stdout) => {
                if (!error && stdout.includes('db version')) {
                    resolve({ found: true, version: stdout.split('\n')[0] });
                } else {
                    resolve({ found: false });
                }
            });
        });
    }

    // Install MongoDB based on platform
    async installMongoDB(progressCallback) {
        try {
            if (this.platform === 'win32') {
                return await this.installWindows(progressCallback);
            } else if (this.platform === 'linux') {
                return await this.installLinux(progressCallback);
            } else {
                throw new Error('Unsupported platform for automatic installation');
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Windows installation using winget
    installWindows(progressCallback) {
        return new Promise((resolve) => {
            progressCallback({ progress: 10, message: 'Starting Windows installation...' });
            
            // Try winget first
            const wingetProcess = spawn('winget', ['install', 'MongoDB.Server', '--accept-package-agreements', '--accept-source-agreements'], {
                stdio: 'pipe'
            });

            let output = '';
            wingetProcess.stdout.on('data', (data) => {
                output += data.toString();
                if (output.includes('Installing')) {
                    progressCallback({ progress: 50, message: 'Installing MongoDB...' });
                } else if (output.includes('Successfully')) {
                    progressCallback({ progress: 90, message: 'Installation complete...' });
                }
            });

            wingetProcess.on('close', (code) => {
                if (code === 0) {
                    progressCallback({ progress: 100, message: 'MongoDB installed successfully!' });
                    resolve({ success: true });
                } else {
                    // Fallback to manual download instructions
                    resolve({ 
                        success: false, 
                        error: 'Automatic installation failed. Please install manually from https://www.mongodb.com/try/download/community' 
                    });
                }
            });

            wingetProcess.on('error', () => {
                resolve({ 
                    success: false, 
                    error: 'winget not available. Please install MongoDB manually from https://www.mongodb.com/try/download/community' 
                });
            });
        });
    }

    // Linux installation using package managers
    installLinux(progressCallback) {
        return new Promise((resolve) => {
            progressCallback({ progress: 10, message: 'Detecting Linux distribution...' });
            
            // Check if we have apt (Ubuntu/Debian)
            exec('which apt-get', (error) => {
                if (!error) {
                    this.installUbuntu(progressCallback, resolve);
                } else {
                    // Check for yum (CentOS/RHEL)
                    exec('which yum', (yumError) => {
                        if (!yumError) {
                            this.installCentOS(progressCallback, resolve);
                        } else {
                            resolve({ 
                                success: false, 
                                error: 'Unsupported Linux distribution. Please install MongoDB manually.' 
                            });
                        }
                    });
                }
            });
        });
    }

    // Ubuntu/Debian installation
    installUbuntu(progressCallback, resolve) {
        progressCallback({ progress: 20, message: 'Installing on Ubuntu/Debian...' });
        
        const commands = [
            'sudo apt-get update',
            'sudo apt-get install -y mongodb'
        ];
        
        this.runCommands(commands, progressCallback, resolve);
    }

    // CentOS/RHEL installation
    installCentOS(progressCallback, resolve) {
        progressCallback({ progress: 20, message: 'Installing on CentOS/RHEL...' });
        
        const commands = [
            'sudo yum install -y mongodb-server'
        ];
        
        this.runCommands(commands, progressCallback, resolve);
    }

    // Run installation commands sequentially
    runCommands(commands, progressCallback, resolve) {
        let currentCommand = 0;
        
        const runNext = () => {
            if (currentCommand >= commands.length) {
                progressCallback({ progress: 90, message: 'Starting MongoDB service...' });
                this.startMongoService(progressCallback, resolve);
                return;
            }
            
            const cmd = commands[currentCommand];
            const progress = 30 + (currentCommand / commands.length) * 50;
            progressCallback({ progress, message: `Running: ${cmd}` });
            
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    resolve({ 
                        success: false, 
                        error: `Command failed: ${cmd}\n${stderr}` 
                    });
                    return;
                }
                
                currentCommand++;
                runNext();
            });
        };
        
        runNext();
    }

    // Start MongoDB service
    startMongoService(progressCallback, resolve) {
        const startCommands = [
            'sudo systemctl start mongodb',
            'sudo systemctl enable mongodb'
        ];
        
        exec(startCommands.join(' && '), (error) => {
            if (error) {
                // Try alternative service name
                exec('sudo systemctl start mongod && sudo systemctl enable mongod', (altError) => {
                    if (altError) {
                        resolve({ 
                            success: false, 
                            error: 'MongoDB installed but failed to start service' 
                        });
                    } else {
                        progressCallback({ progress: 100, message: 'MongoDB installed and started!' });
                        resolve({ success: true });
                    }
                });
            } else {
                progressCallback({ progress: 100, message: 'MongoDB installed and started!' });
                resolve({ success: true });
            }
        });
    }
}

module.exports = MongoInstaller;