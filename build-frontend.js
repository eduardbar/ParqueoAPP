/**
 * 🔧 Configuración de Construcción para Vercel - Frontend
 * 
 * Script que prepara el frontend para deployment en Vercel.
 * Optimiza la aplicación React para producción.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando construcción de ParqueoAPP Frontend...');

try {
  // Navegar al directorio del frontend
  process.chdir(path.join(__dirname, 'frontend'));
  
  console.log('📦 Instalando dependencias...');
  execSync('npm ci', { stdio: 'inherit' });
  
  console.log('🏗️ Construyendo aplicación...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Frontend construido exitosamente para producción');
  
} catch (error) {
  console.error('❌ Error en la construcción:', error.message);
  process.exit(1);
}
