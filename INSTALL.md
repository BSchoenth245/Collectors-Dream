# Installation Guide

## For End Users (Download App)

### Windows
1. Download `Collectors-Dream-Setup-1.0.0.exe` from releases
2. Run the installer
3. Launch "Collector's Dream" from Start Menu

### macOS
1. Download `Collectors-Dream-1.0.0.dmg` from releases
2. Open the DMG file
3. Drag the app to Applications folder
4. Launch from Applications

### Linux
1. Download `Collectors-Dream-1.0.0.AppImage` from releases
2. Make it executable: `chmod +x Collectors-Dream-1.0.0.AppImage`
3. Run: `./Collectors-Dream-1.0.0.AppImage`

## For Developers (Clone Repository)

### Prerequisites
- Node.js (v14+): https://nodejs.org/
- MongoDB Community: https://www.mongodb.com/try/download/community

### Setup Steps
1. Clone the repository
2. Run: `npm run setup`
3. Start: `npm start`

### Building Releases
1. Install dev dependencies: `npm install`
2. Build: `npm run build`
3. Find executables in `dist/` folder

## Troubleshooting

**MongoDB not found**: Install MongoDB Community Edition first
**Port 8000 in use**: Change port in server.js
**Permission denied**: Run with appropriate permissions