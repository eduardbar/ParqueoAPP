#!/usr/bin/env bash

echo "🎨 Validando configuración de Tailwind CSS..."

# Verificar que Tailwind CSS esté instalado
echo "Verificando instalación de Tailwind CSS..."
if npm list tailwindcss > /dev/null 2>&1; then
    echo "✅ Tailwind CSS está instalado"
else
    echo "❌ Tailwind CSS no está instalado"
    echo "Instalando Tailwind CSS..."
    npm install -D tailwindcss postcss autoprefixer
fi

# Verificar que PostCSS esté configurado
echo "Verificando configuración de PostCSS..."
if [ -f "postcss.config.js" ]; then
    echo "✅ PostCSS está configurado"
else
    echo "❌ PostCSS no está configurado"
    echo "Creando configuración de PostCSS..."
    cat > postcss.config.js << EOF
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
fi

# Verificar que el archivo de configuración de Tailwind exista
echo "Verificando configuración de Tailwind..."
if [ -f "tailwind.config.js" ]; then
    echo "✅ Tailwind config está configurado"
else
    echo "❌ Tailwind config no está configurado"
    echo "Creando configuración de Tailwind..."
    npx tailwindcss init -p
fi

echo "✅ Configuración de Tailwind CSS validada"
echo "💡 Reinicia VS Code para aplicar todos los cambios"
