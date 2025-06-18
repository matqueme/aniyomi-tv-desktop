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
Copy-Item "icon.svg" "dist/"

# Create .tizen-package directory
New-Item -ItemType Directory -Force -Path ".tizen-package"

# Copy everything to .tizen-package for Tizen Studio
Write-Host "Preparing Tizen package..." -ForegroundColor Yellow
Copy-Item "dist\*" ".tizen-package\" -Recurse

# Create Tizen Studio project files
Write-Host "Creating Tizen Studio project files..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path ".tizen-package\.settings"

# Create .project file
@"
<?xml version="1.0" encoding="UTF-8"?>
<projectDescription>
	<name>aniyomi-tizen</name>
	<comment></comment>
	<projects>
	</projects>
	<buildSpec>
		<buildCommand>
			<name>json.validation.builder</name>
			<arguments>
			</arguments>
		</buildCommand>
		<buildCommand>
			<name>org.tizen.web.project.builder.WebBuilder</name>
			<arguments>
			</arguments>
		</buildCommand>
	</buildSpec>
	<natures>
		<nature>json.validation.nature</nature>
		<nature>org.eclipse.wst.jsdt.core.jsNature</nature>
		<nature>org.tizen.web.project.builder.WebNature</nature>
	</natures>
</projectDescription>
"@ | Out-File -FilePath ".tizen-package\.project" -Encoding UTF8


# Create Tizen project configuration
@"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<tproject xmlns="http://www.tizen.org/tproject">
    <platforms>
        <platform>
            <name>tv-samsung-9.0</name>
        </platform>
    </platforms>
    <package>
        <blacklist/>
        <resFallback autoGen="true"/>
    </package>
</tproject>
"@ | Out-File -FilePath ".tizen-package\.tproject" -Encoding UTF8

Write-Host "Build completed!" -ForegroundColor Green
Write-Host "Your Tizen app is ready in the '.tizen-package' directory" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open Tizen Studio"
Write-Host "2. Import project from '.tizen-package' directory"
Write-Host "3. Build and deploy to your Samsung TV"
