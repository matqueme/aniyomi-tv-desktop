#!/bin/bash

# Build script for Tizen TV application
echo "Building Aniyomi Tizen for Tizen TV..."

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist/
rm -rf .tizen-package/

# Build with Vite
echo "Building with Vite..."
npm run build

# Copy Tizen-specific files to dist
echo "Copying Tizen configuration files..."
cp config.xml dist/
cp tizen-manifest.json dist/
cp icon.svg dist/
cp icon.svg dist/icon.png

# Create .tizen-package directory
mkdir -p .tizen-package

# Copy everything to .tizen-package for Tizen Studio
echo "Preparing Tizen package..."
cp -r dist/* .tizen-package/

echo "Build completed!"
echo "Your Tizen app is ready in the '.tizen-package' directory"
echo ""
echo "Next steps:"
echo "1. Open Tizen Studio"
echo "2. Import project from '.tizen-package' directory"
echo "3. Build and deploy to your Samsung TV"
