// === MONGODB INSTALLER MODULE ===
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

class MongoInstaller {
    constructor() {
        this.strPlatform = os.platform();
        this.strArch = os.arch();
    }

    // Check if MongoDB is installed
    checkMongoDB() {
        return new Promise((resolve) => {
            exec('mongod --version', (error, strStdout) => {
                if (!error && strStdout.includes('db version')) {
                    resolve({ found: true, version: strStdout.split('\n')[0] });
                } else {
                    resolve({ found: false });
                }
            });
        });
    }

    // Install MongoDB based on platform
    async installMongoDB(fnProgressCallback) {
        try {
            if (this.strPlatform === 'win32') {
                return await this.installWindows(fnProgressCallback);
            } else if (this.strPlatform === 'linux') {
                return await this.installLinux(fnProgressCallback);
            } else {
                throw new Error('Unsupported platform for automatic installation');
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Windows installation using winget
    installWindows(fnProgressCallback) {
        return new Promise((resolve) => {
            fnProgressCallback({ progress: 10, message: 'Starting Windows installation...' });
            
            // Try winget first
            const objWingetProcess = spawn('winget', ['install', 'MongoDB.Server', '--accept-package-agreements', '--accept-source-agreements'], {
                stdio: 'pipe'
            });

            let strOutput = '';
            objWingetProcess.stdout.on('data', (data) => {
                strOutput += data.toString();
                if (strOutput.includes('Installing')) {
                    fnProgressCallback({ progress: 50, message: 'Installing MongoDB...' });
                } else if (strOutput.includes('Successfully')) {
                    fnProgressCallback({ progress: 90, message: 'Installation complete...' });
                }
            });

            objWingetProcess.on('close', (intCode) => {
                if (intCode === 0) {
                    fnProgressCallback({ progress: 100, message: 'MongoDB installed successfully!' });
                    resolve({ success: true });
                } else {
                    // Fallback to manual download instructions
                    resolve({ 
                        success: false, 
                        error: 'Automatic installation failed. Please install manually from https://www.mongodb.com/try/download/community' 
                    });
                }
            });

            objWingetProcess.on('error', () => {
                resolve({ 
                    success: false, 
                    error: 'winget not available. Please install MongoDB manually from https://www.mongodb.com/try/download/community' 
                });
            });
        });
    }

    // Linux installation using package managers
    installLinux(fnProgressCallback) {
        return new Promise((resolve) => {
            fnProgressCallback({ progress: 10, message: 'Detecting Linux distribution...' });
            
            // Check if we have apt (Ubuntu/Debian)
            exec('which apt-get', (error) => {
                if (!error) {
                    this.installUbuntu(fnProgressCallback, resolve);
                } else {
                    // Check for yum (CentOS/RHEL)
                    exec('which yum', (objYumError) => {
                        if (!objYumError) {
                            this.installCentOS(fnProgressCallback, resolve);
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
    installUbuntu(fnProgressCallback, fnResolve) {
        fnProgressCallback({ progress: 20, message: 'Installing on Ubuntu/Debian...' });
        
        const arrCommands = [
            'sudo apt-get update',
            'sudo apt-get install -y mongodb'
        ];
        
        this.runCommands(arrCommands, fnProgressCallback, fnResolve);
    }

    // CentOS/RHEL installation
    installCentOS(fnProgressCallback, fnResolve) {
        fnProgressCallback({ progress: 20, message: 'Installing on CentOS/RHEL...' });
        
        const arrCommands = [
            'sudo yum install -y mongodb-server'
        ];
        
        this.runCommands(arrCommands, fnProgressCallback, fnResolve);
    }

    // Run installation commands sequentially
    runCommands(arrCommands, fnProgressCallback, fnResolve) {
        let intCurrentCommand = 0;
        
        const fnRunNext = () => {
            if (intCurrentCommand >= arrCommands.length) {
                fnProgressCallback({ progress: 90, message: 'Starting MongoDB service...' });
                this.startMongoService(fnProgressCallback, fnResolve);
                return;
            }
            
            const strCmd = arrCommands[intCurrentCommand];
            const intProgress = 30 + (intCurrentCommand / arrCommands.length) * 50;
            fnProgressCallback({ progress: intProgress, message: `Running: ${strCmd}` });
            
            exec(strCmd, (error, strStdout, strStderr) => {
                if (error) {
                    fnResolve({ 
                        success: false, 
                        error: `Command failed: ${strCmd}\n${strStderr}` 
                    });
                    return;
                }
                
                intCurrentCommand++;
                fnRunNext();
            });
        };
        
        fnRunNext();
    }

    // Start MongoDB service
    startMongoService(fnProgressCallback, fnResolve) {
        const arrStartCommands = [
            'sudo systemctl start mongodb',
            'sudo systemctl enable mongodb'
        ];
        
        exec(arrStartCommands.join(' && '), (error) => {
            if (error) {
                // Try alternative service name
                exec('sudo systemctl start mongod && sudo systemctl enable mongod', (objAltError) => {
                    if (objAltError) {
                        fnResolve({ 
                            success: false, 
                            error: 'MongoDB installed but failed to start service' 
                        });
                    } else {
                        fnProgressCallback({ progress: 100, message: 'MongoDB installed and started!' });
                        fnResolve({ success: true });
                    }
                });
            } else {
                fnProgressCallback({ progress: 100, message: 'MongoDB installed and started!' });
                fnResolve({ success: true });
            }
        });
    }
}

module.exports = MongoInstaller;