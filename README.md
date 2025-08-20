# Collector's Dream

**Transform the way you organize your life with a powerful, flexible database system designed for collectors and organizers.**

Collector's Dream is a comprehensive database management application that empowers you to categorize, organize, and reference virtually anything in your life through one centralized, easy-to-manage system. Whether you're a passionate collector of trading cards, books, movies, vintage items, or someone who simply wants to organize household inventory, personal documents, or hobby materials, this application provides the flexibility and power to create custom categories tailored to your specific needs.

## Why Collector's Dream?

- **Universal Organization**: Create unlimited custom categories for any type of collection or inventory
- **Flexible Data Structure**: Define your own fields and data types for each category
- **Powerful Search & Filter**: Quickly locate any item across all your collections
- **Cross-Platform**: Available as both web application and desktop app for Windows and Linux
- **Local Data Control**: Your data stays on your machine with MongoDB local storage
- **Scalable**: From small personal collections to extensive databases with thousands of items

## 🚀 Quick Start

### Option 1: Download Pre-built Application (Recommended)

**For most users, this is the easiest way to get started:**

1. **Download**: Visit the [Releases](../../releases) page and download the latest version:
   - **Windows**: `Collectors-Dream-Setup-1.0.1.exe`
   - **Linux**: `Collectors-Dream-1.0.1.AppImage`

2. **Install & Run**:
   - **Windows**: Double-click the installer and follow the setup wizard
   - **Linux**: 
     - Right-click the AppImage file
     - Select Properties → Permissions
     - Check "Allow executing file as program"
     - Double-click to launch

3. **First Launch**: The application will automatically:
   - Check for MongoDB installation
   - Set up the local database
   - Launch the interface

### Option 2: Run from Source Code

**For developers or users who want to customize the application:**

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/collectors-dream.git
   cd collectors-dream
   ```

2. **Automated Setup**:
   ```bash
   npm run setup
   ```
   This script will:
   - Install all dependencies
   - Check for MongoDB
   - Configure the database
   - Verify the installation

3. **Launch the Application**:
   ```bash
   npm start        # Web version (browser-based)
   npm run desktop  # Desktop app (native window)
   ```

## ⚙️ System Requirements

### Minimum Requirements
- **Operating System**: Windows 10+ or Linux (Ubuntu 18.04+, similar distributions)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for application, additional space for your collections
- **Network**: Internet connection for initial setup only

### Dependencies (Auto-installed)
- **Node.js** (v14 or higher) - JavaScript runtime
- **MongoDB Community Edition** - Local database storage

**Note**: The setup script automatically detects and installs missing dependencies with your permission.

## 📚 How to Use Collector's Dream

### Getting Started

1. **Launch the Application**
   - **Pre-built App**: Double-click the installed application
   - **From Source**: Run `npm start` (web) or `npm run desktop` (desktop app)

2. **Create Your First Category**
   - Click "Add New Category" on the main dashboard
   - Choose from templates (Pokemon Cards, Books, Movies) or create custom
   - Define fields relevant to your collection (e.g., Name, Condition, Value, Date Acquired)

3. **Add Items to Your Collection**
   - Select a category from the dashboard
   - Click "Add New Item"
   - Fill in the custom form fields you defined
   - Save to add the item to your database

4. **Search and Organize**
   - Use the search bar to find items across all categories
   - Apply filters to narrow down results
   - Sort by any field to organize your view

### Interface Options

**Web Version** (`npm start`):
- Access via browser at `http://localhost:8000`
- Great for quick access and sharing screens
- Full functionality with responsive design

**Desktop Version** (`npm run desktop`):
- Native application window
- Enhanced performance for large collections
- Integrated system notifications
- Offline-first design

## Key Features

### 🗂️ **Unlimited Custom Categories**
- Create categories for any type of collection or inventory
- Pre-built templates for popular collections (Pokemon cards, books, movies)
- Define custom fields specific to each category
- Support for text, numbers, dates, and boolean data types

### 🔍 **Advanced Search & Organization**
- Real-time search across all collections
- Filter by category, field values, or custom criteria
- Sort and organize items by any field
- Quick access to recently added or modified items

### 💾 **Secure Local Storage**
- All data stored locally using MongoDB
- No cloud dependency - your data stays private
- Automatic data persistence and backup
- Import/export capabilities for data portability

### 🖥️ **Dual Interface Options**
- **Web Version**: Access through any modern browser
- **Desktop App**: Native application with enhanced performance
- Consistent experience across both platforms
- Responsive design for various screen sizes

## 🎯 Example Use Cases

**Collectors**:
- Trading card collections (Pokemon, Magic, Sports cards)
- Comic books with issue numbers, conditions, and values
- Vinyl records with pressing details and catalog numbers
- Vintage items with provenance and authentication details

**Personal Organization**:
- Home inventory for insurance purposes
- Book libraries with reading status and ratings
- Movie/TV show watchlists with personal ratings
- Recipe collections with ingredients and cooking notes

**Professional Use**:
- Small business inventory management
- Equipment tracking with maintenance schedules
- Document organization with tags and categories
- Project resource management

## 🔧 Development & Building

### For Developers

**Development Setup**:
```bash
git clone https://github.com/your-username/collectors-dream.git
cd collectors-dream
npm install
npm run setup
```

**Development Commands**:
```bash
npm start          # Launch web version for testing
npm run desktop    # Launch desktop app for testing
npm run setup      # Reinstall/reconfigure dependencies
```

### Building Distribution Files

**Create downloadable applications**:
```bash
# Build for all supported platforms
npm run build

# Build for specific platforms
npm run build-win    # Windows installer (.exe)
npm run build-linux  # Linux AppImage (.AppImage)

# Publish release (requires GitHub configuration)
npm run release
```

**Output**: Built applications are saved in the `dist/` folder and ready for distribution.

## ⚠️ Known Issues & Limitations

### Linux Desktop Integration
- **App Icon**: Custom icons display in the application window but may show default Electron icon in file managers/taskbars
- **Cause**: AppImage format limitations with certain Linux desktop environments
- **Impact**: Visual only - does not affect functionality

### Performance Considerations
- **Large Collections**: Collections with 10,000+ items may experience slower search performance
- **Recommendation**: Use category filters to improve search speed on large datasets

## 🔍 Troubleshooting

### Common Issues

**Application Won't Start**:
1. Verify MongoDB is installed and running
2. Check if port 8000 is available
3. Ensure you have write permissions in the application directory

**Database Connection Failed**:
1. Restart MongoDB service: `sudo systemctl restart mongod` (Linux)
2. Check database directory permissions: `./data/db`
3. Review MongoDB logs for specific error messages

**Port Already in Use**:
1. Change the port in `server.js` (line ~10): `const PORT = 8001;`
2. Or stop the process using port 8000: `lsof -ti:8000 | xargs kill -9`

**Permission Denied (Linux)**:
1. Ensure the application can create the `data` directory
2. Run with appropriate permissions: `chmod +x Collectors-Dream-1.0.1.AppImage`
3. For development: `sudo chown -R $USER:$USER ./data`

### Getting Help

- **Issues**: Report bugs on the [GitHub Issues](../../issues) page
- **Feature Requests**: Use the [GitHub Discussions](../../discussions) section
- **Documentation**: Check the [Wiki](../../wiki) for detailed guides

## 📜 License & Contributing

**License**: ISC - Free for personal and commercial use

**Contributing**:
- Fork the repository
- Create a feature branch
- Submit a pull request with detailed description
- Follow existing code style and conventions

**Support the Project**:
- ⭐ Star this repository if you find it useful
- 🐛 Report bugs and suggest improvements
- 💬 Share your use cases and feedback

---

**Made with ❤️ for collectors and organizers everywhere**