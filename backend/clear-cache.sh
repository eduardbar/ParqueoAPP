#!/usr/bin/env bash

echo "🧹 Limpiando cache de TypeScript y VS Code..."

# Limpiar cache de TypeScript
echo "Limpiando TypeScript build cache..."
npx tsc --build --clean

# Limpiar node_modules y reinstalar
echo "Limpiando node_modules..."
rm -rf node_modules
rm -rf package-lock.json

# Reinstalar dependencias
echo "Reinstalando dependencias..."
npm install

# Regenerar cliente Prisma
echo "Regenerando cliente Prisma..."
npx prisma generate

echo "✅ Cache limpiado. Ahora reinicia VS Code para aplicar cambios."
echo "💡 Usa: Ctrl+Shift+P -> 'Developer: Reload Window'"
