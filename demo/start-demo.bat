@echo off
echo.
echo 🚗 Iniciando ParqueoApp Demo...
echo.

REM Verificar si existe el directorio demo
if not exist "demo" (
    echo ❌ Error: Directorio demo no encontrado
    pause
    exit /b 1
)

REM Cambiar al directorio demo
cd demo

echo 📂 Cambiando al directorio demo...

REM Intentar con diferentes métodos para servir el archivo
echo 🌐 Iniciando servidor web...

REM Opción 1: Python (más común en Windows)
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Usando Python HTTP Server en puerto 3000
    echo 🌍 Abriendo http://localhost:3000 en tu navegador...
    timeout /t 2 /nobreak >nul
    start http://localhost:3000
    python -m http.server 3000
    goto :end
)

REM Opción 2: Node.js con npx serve
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Usando Node.js serve en puerto 3000
    echo 🌍 Abriendo http://localhost:3000 en tu navegador...
    timeout /t 2 /nobreak >nul
    start http://localhost:3000
    npx serve -s . -l 3000
    goto :end
)

REM Opción 3: Abrir directamente el archivo HTML
echo 🔧 No se encontró Python ni Node.js
echo 📂 Abriendo demo directamente desde archivo...
start index.html

:end
echo.
echo 🎉 Demo finalizada. ¡Gracias por probar ParqueoApp!
pause
