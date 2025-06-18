#!/bin/bash

# Build script for Tizen TV application (Linux/macOS)
echo -e "\033[32mBuilding Aniyomi Tizen for Tizen TV...\033[0m"

# Clean previous build
echo -e "\033[33mCleaning previous build...\033[0m"
rm -rf dist/
rm -rf .tizen-package/

# Build with Vite
echo -e "\033[33mBuilding with Vite...\033[0m"
pnpm run build

if [ $? -ne 0 ]; then
    echo -e "\033[31mBuild failed!\033[0m"
    exit 1
fi

# Copy Tizen-specific files to dist
echo -e "\033[33mCopying Tizen configuration files...\033[0m"
cp config.xml dist/
cp icon.svg dist/
cp icon.png dist/

# Create .tizen-package directory
mkdir -p .tizen-package

# Copy everything to .tizen-package for Tizen Studio
echo -e "\033[33mPreparing Tizen package...\033[0m"
cp -r dist/* .tizen-package/

# Copy Tizen Studio project files
echo -e "\033[33mCopying Tizen Studio project files...\033[0m"
cp .project .tizen-package/
cp .tproject .tizen-package/

echo -e "\033[32mBuild completed!\033[0m"
echo -e "\033[36mYour Tizen app is ready in the '.tizen-package' directory\033[0m"
echo ""
echo -e "\033[33mNext steps:\033[0m"
echo "1. Open Tizen Studio"
echo "2. Import project from '.tizen-package' directory"
echo "3. Build and deploy to your Samsung TV"
