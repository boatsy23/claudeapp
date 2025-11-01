@echo off
REM ==============================================================================
REM AFL FANTASY MANAGER - CLEAN PROJECT STRUCTURE GENERATOR (WINDOWS)
REM Creates the complete folder structure for PWA-ready app
REM ==============================================================================

echo Creating AFL Fantasy Manager project structure...
echo.

REM ==============================================================================
REM ROOT LEVEL
REM ==============================================================================

echo Creating root directories...

mkdir client 2>nul
mkdir backend 2>nul
mkdir scrapers 2>nul
mkdir data 2>nul
mkdir public 2>nul
mkdir docs 2>nul

REM ==============================================================================
REM CLIENT (FRONTEND)
REM ==============================================================================

echo Creating client structure...

mkdir client\public 2>nul
mkdir client\src\pages 2>nul
mkdir client\src\components\dashboard 2>nul
mkdir client\src\components\lineup 2>nul
mkdir client\src\components\player-stats 2>nul
mkdir client\src\components\leagues 2>nul
mkdir client\src\components\tools\captain 2>nul
mkdir client\src\components\tools\trade 2>nul
mkdir client\src\components\tools\team-manager 2>nul
mkdir client\src\components\layout 2>nul
mkdir client\src\components\ui 2>nul
mkdir client\src\hooks 2>nul
mkdir client\src\lib 2>nul
mkdir client\src\styles 2>nul
mkdir client\src\constants 2>nul
mkdir client\src\types 2>nul
mkdir client\src\utils 2>nul

REM ==============================================================================
REM BACKEND (API)
REM ==============================================================================

echo Creating backend structure...

mkdir backend\src\routes 2>nul
mkdir backend\src\controllers 2>nul
mkdir backend\src\services 2>nul
mkdir backend\src\models 2>nul
mkdir backend\src\middleware 2>nul
mkdir backend\src\utils 2>nul
mkdir backend\src\types 2>nul
mkdir backend\src\config 2>nul

REM ==============================================================================
REM SCRAPERS (PYTHON)
REM ==============================================================================

echo Creating scrapers structure...

mkdir scrapers\afl_official 2>nul
mkdir scrapers\fantasy_stats 2>nul
mkdir scrapers\shared 2>nul

REM ==============================================================================
REM PUBLIC ASSETS
REM ==============================================================================

echo Creating public assets structure...

mkdir public\images\team-logos 2>nul
mkdir public\images\player-photos 2>nul
mkdir public\icons 2>nul

REM ==============================================================================
REM DATA (TEMPORARY)
REM ==============================================================================

echo Creating data directories...

mkdir data\players 2>nul
mkdir data\teams 2>nul
mkdir data\fixtures 2>nul
mkdir data\stats 2>nul

REM ==============================================================================
REM CREATE PLACEHOLDER FILES
REM ==============================================================================

echo Creating placeholder files...

REM Root files
type nul > .gitignore
type nul > .env.example
type nul > README.md
type nul > package.json

REM Client files
type nul > client\package.json
type nul > client\vite.config.ts
type nul > client\tsconfig.json
type nul > client\tailwind.config.ts
type nul > client\postcss.config.js
type nul > client\index.html
type nul > client\src\main.tsx
type nul > client\src\App.tsx
type nul > client\src\index.css

REM Client pages
type nul > client\src\pages\dashboard.tsx
type nul > client\src\pages\lineup.tsx
type nul > client\src\pages\player-stats.tsx
type nul > client\src\pages\leagues.tsx
type nul > client\src\pages\stats.tsx
type nul > client\src\pages\profile.tsx
type nul > client\src\pages\not-found.tsx

REM Client components
type nul > client\src\components\dashboard\score-card.tsx
type nul > client\src\components\dashboard\performance-chart.tsx
type nul > client\src\components\dashboard\team-structure.tsx
type nul > client\src\components\layout\header.tsx
type nul > client\src\components\layout\bottom-nav.tsx

REM Client UI components
type nul > client\src\components\ui\button.tsx
type nul > client\src\components\ui\card.tsx
type nul > client\src\components\ui\select.tsx
type nul > client\src\components\ui\toaster.tsx
type nul > client\src\components\ui\tooltip.tsx

REM Client lib
type nul > client\src\lib\error-logger.ts
type nul > client\src\lib\utils.ts
type nul > client\src\lib\queryClient.ts

REM Client styles
type nul > client\src\styles\pwa-native.css

REM Backend files
type nul > backend\package.json
type nul > backend\tsconfig.json
type nul > backend\src\index.ts
type nul > backend\src\routes\team-api.ts
type nul > backend\src\routes\stats-routes.ts
type nul > backend\src\services\teamService.ts
type nul > backend\src\config\database.ts

REM Docs
type nul > docs\API_DOCUMENTATION.md

echo.
echo Project structure created successfully!
echo.
echo Next steps:
echo 1. Copy your files into the appropriate folders
echo 2. Run 'npm install' in /client and /backend
echo 3. Start coding!
echo.
echo Folder guide:
echo    /client/src/pages/          - Full page components
echo    /client/src/components/     - Reusable components
echo    /client/src/lib/            - Utilities
echo    /backend/src/routes/        - API endpoints
echo.
pause