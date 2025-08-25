const { build, Platform } = require('electron-builder');

async function buildFast() {
    console.log('🚀 Starting fast Windows build...');
    
    const objConfig = {
        win: {
            target: { target: 'nsis', arch: ['x64'] }
        },
        compression: 'store',
        nsis: {
            differentialPackage: false,
            oneClick: false
        },
        nodeGypRebuild: false,
        buildDependenciesFromSource: false,
        npmRebuild: false
    };

    try {
        await build({
            targets: Platform.WINDOWS.createTarget(),
            config: objConfig
        });
        console.log('✅ Fast build complete!');
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

buildFast();