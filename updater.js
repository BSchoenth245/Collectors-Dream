const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

class AppUpdater {
    constructor() {
        autoUpdater.checkForUpdatesAndNotify();
        
        autoUpdater.on('update-available', () => {
            dialog.showMessageBox({
                type: 'info',
                title: 'Update available',
                message: 'A new version is available. It will be downloaded in the background.',
                buttons: ['OK']
            });
        });

        autoUpdater.on('update-downloaded', () => {
            dialog.showMessageBox({
                type: 'info',
                title: 'Update ready',
                message: 'Update downloaded. The application will restart to apply the update.',
                buttons: ['Restart', 'Later']
            }).then((result) => {
                if (result.response === 0) {
                    autoUpdater.quitAndInstall();
                }
            });
        });
    }
}

module.exports = AppUpdater;