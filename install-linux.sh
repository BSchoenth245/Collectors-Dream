#!/bin/bash

# Collector's Dream Linux Installer
# Provides Windows-like installation experience

set -e

APP_NAME="Collectors Dream"
APP_DIR="$HOME/.local/share/collectors-dream"
DESKTOP_FILE="$HOME/.local/share/applications/collectors-dream.desktop"
ICON_FILE="$APP_DIR/collectors-dream.png"
APPIMAGE_FILE="$APP_DIR/collectors-dream.AppImage"

echo "🚀 Installing $APP_NAME..."

# Create application directory
mkdir -p "$APP_DIR"
mkdir -p "$HOME/.local/share/applications"

# Copy AppImage to application directory
cp "$(dirname "$0")/Collectors-Dream-1.0.9.AppImage" "$APPIMAGE_FILE"
chmod +x "$APPIMAGE_FILE"

# Extract and copy icon
if command -v convert >/dev/null 2>&1; then
    # Use ImageMagick if available
    "$APPIMAGE_FILE" --appimage-extract-and-run --help >/dev/null 2>&1 || true
    if [ -f "squashfs-root/collectors-dream.png" ]; then
        cp "squashfs-root/collectors-dream.png" "$ICON_FILE"
        rm -rf squashfs-root
    fi
fi

# Create desktop entry
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Name=Collectors Dream
Comment=A database management system for collectors
Exec=$APPIMAGE_FILE
Icon=$ICON_FILE
Type=Application
Categories=Utility;Database;
StartupNotify=true
EOF

# Make desktop file executable
chmod +x "$DESKTOP_FILE"

# Check and install MongoDB
echo "🔍 Checking MongoDB installation..."
if ! command -v mongod >/dev/null 2>&1; then
    echo "📦 MongoDB not found. Installing..."
    
    # Detect distribution
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        echo "🐧 Detected Debian/Ubuntu system"
        sudo apt-get update
        sudo apt-get install -y mongodb
        sudo systemctl enable mongodb
        sudo systemctl start mongodb
    elif [ -f /etc/redhat-release ]; then
        # Red Hat/CentOS/Fedora
        echo "🎩 Detected Red Hat-based system"
        if command -v dnf >/dev/null 2>&1; then
            sudo dnf install -y mongodb-server
        else
            sudo yum install -y mongodb-server
        fi
        sudo systemctl enable mongod
        sudo systemctl start mongod
    elif [ -f /etc/arch-release ]; then
        # Arch Linux
        echo "🏹 Detected Arch Linux"
        sudo pacman -S --noconfirm mongodb
        sudo systemctl enable mongodb
        sudo systemctl start mongodb
    else
        echo "⚠️  Unknown distribution. Please install MongoDB manually:"
        echo "   Visit: https://docs.mongodb.com/manual/installation/"
    fi
else
    echo "✅ MongoDB already installed"
fi

# Update desktop database
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$HOME/.local/share/applications"
fi

echo "✅ Installation complete!"
echo "📱 You can now launch $APP_NAME from your applications menu"
echo "🚀 Or run: $APPIMAGE_FILE"

# Ask to launch now
read -p "🎯 Launch $APP_NAME now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    "$APPIMAGE_FILE" &
    echo "🎉 $APP_NAME is starting..."
fi