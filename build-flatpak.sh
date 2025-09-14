#!/bin/bash

# Build Flatpak for Collector's Dream
echo "🔨 Building Flatpak package..."

# Clean previous builds
rm -rf build-dir repo collectors-dream.flatpak

# Build the Flatpak
flatpak-builder --disable-rofiles-fuse --repo=repo --force-clean build-dir com.collectorsdream.CollectorsDream.yml

# Create distributable .flatpak file
flatpak build-bundle repo collectors-dream.flatpak com.collectorsdream.CollectorsDream

# Move to dist directory
mkdir -p dist
mv collectors-dream.flatpak dist/

echo "✅ Flatpak created: dist/collectors-dream.flatpak"
echo "📦 Ready for distribution!"