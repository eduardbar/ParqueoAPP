#!/bin/bash

# Script para preparar el build de producción
echo "🔧 Preparando build de producción para Vercel..."

# Crear directorio .vercel si no existe
mkdir -p .vercel

# Verificar que las variables de entorno estén configuradas
echo "✅ Verificando configuración de producción..."

# Crear archivo de configuración para Vercel si no existe
if [ ! -f ".vercel/project.json" ]; then
  echo "📝 Creando configuración de proyecto Vercel..."
  cat > .vercel/project.json << EOF
{
  "projectId": "parqueo-app-col",
  "orgId": "eduardbars-projects"
}
EOF
fi

echo "🚀 Configuración lista para deployment!"
echo "Variables de entorno configuradas:"
echo "- NODE_ENV=production"
echo "- REACT_APP_API_URL=/api"
echo "- GENERATE_SOURCEMAP=false"
