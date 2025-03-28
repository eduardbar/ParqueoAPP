/**
 * 🔧 Configuración de Construcción para Vercel - Backend
 * 
 * Script que prepara el backend para deployment en Vercel.
 * Compila TypeScript y optimiza para producción.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando construcción de ParqueoAPP Backend...');

try {
  // Navegar al directorio del backend
  process.chdir(path.join(__dirname, 'backend'));
  
  console.log('📦 Instalando dependencias...');
  execSync('npm ci', { stdio: 'inherit' });
  
  console.log('🔨 Compilando TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });
  
  console.log('✅ Backend construido exitosamente para producción');
  
} catch (error) {
  console.error('❌ Error en la construcción:', error.message);
  process.exit(1);
}
