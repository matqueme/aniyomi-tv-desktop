# Build script for Tizen TV application (Windows)
Write-Host "Building Aniyomi Tizen for Tizen TV..." -ForegroundColor Green

# Clean previous build
Write-Host "Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path ".tizen-package") { Remove-Item -Recurse -Force ".tizen-package" }

# Build with Vite
Write-Host "Building with Vite..." -ForegroundColor Yellow
pnpm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Copy Tizen-specific files to dist
Write-Host "Copying Tizen configuration files..." -ForegroundColor Yellow
Copy-Item "config.xml" "dist/"
Copy-Item "icon.svg" "dist/" -ErrorAction SilentlyContinue
Copy-Item "icon.png" "dist/"
Copy-Item "debug-navigation.html" "dist/" -ErrorAction SilentlyContinue

# Create .tizen-package directory
New-Item -ItemType Directory -Force -Path ".tizen-package"

# Copy everything to .tizen-package for Tizen Studio
Write-Host "Preparing Tizen package..." -ForegroundColor Yellow
Copy-Item "dist\*" ".tizen-package\" -Recurse

# Copy Tizen Studio project files
Write-Host "Copying Tizen Studio project files..." -ForegroundColor Yellow
Copy-Item ".project" ".tizen-package\"
Copy-Item ".tproject" ".tizen-package\"

Write-Host "Build completed!" -ForegroundColor Green
Write-Host "Your Tizen app is ready in the '.tizen-package' directory" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open Tizen Studio"
Write-Host "2. Import project from '.tizen-package' directory"
Write-Host "3. Build and deploy to your Samsung TV"
