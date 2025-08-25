// === AUTO-UPDATER MODULE ===
const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

// Handle automatic app updates
class AppUpdater {
    constructor() {
        autoUpdater.checkForUpdatesAndNotify();
        
        // === UPDATE EVENT HANDLERS ===
        // Handle update available notification
        autoUpdater.on('update-available', () => {
            dialog.showMessageBox({
                type: 'info',
                title: 'Update available',
                message: 'A new version is available. It will be downloaded in the background.',
                buttons: ['OK']
            });
        });

        // Handle update downloaded notification
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