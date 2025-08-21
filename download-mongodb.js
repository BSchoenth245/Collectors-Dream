// === MONGODB BINARY DOWNLOADER ===
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📥 Downloading MongoDB binaries...\n');

// MongoDB download URLs
const MONGODB_URLS = {
    win: 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.5.zip',
    linux: 'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.5.tgz'
};

// Create directories
function createDirectories() {
    const dirs = [
        'mongodb-binaries',
        'mongodb-binaries/win',
        'mongodb-binaries/linux'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }
    });
}

// Download and extract MongoDB binaries
async function downloadMongoDB() {
    createDirectories();
    
    console.log('🔄 Downloading Windows MongoDB...');
    await downloadAndExtract(MONGODB_URLS.win, 'mongodb-binaries/mongodb-win.zip', 'win');
    
    console.log('🔄 Downloading Linux MongoDB...');
    await downloadAndExtract(MONGODB_URLS.linux, 'mongodb-binaries/mongodb-linux.tgz', 'linux');
    
    console.log('\n✅ MongoDB binaries downloaded successfully!');
    console.log('📁 Files are ready in mongodb-binaries/ directory');
}

function downloadAndExtract(url, filename, platform) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        
        https.get(url, (response) => {
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`✅ Downloaded ${platform} MongoDB`);
                
                // Extract the archive
                try {
                    if (platform === 'win') {
                        // For Windows ZIP files, we'll need to extract manually or use a library
                        console.log('⚠️  Please extract mongodb-win.zip manually to mongodb-binaries/win/');
                    } else {
                        // Extract Linux tar.gz
                        execSync(`tar -xzf ${filename} -C mongodb-binaries/linux --strip-components=1`);
                        console.log(`✅ Extracted ${platform} MongoDB`);
                        fs.unlinkSync(filename); // Clean up archive
                    }
                    resolve();
                } catch (error) {
                    console.log(`⚠️  Please extract ${filename} manually to mongodb-binaries/${platform}/`);
                    resolve();
                }
            });
        }).on('error', (err) => {
            fs.unlink(filename, () => {}); // Delete the file on error
            reject(err);
        });
    });
}

// Run the download
downloadMongoDB().catch(console.error);