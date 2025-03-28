// Script para limpiar el localStorage y auth store
// Ejecutar en consola del navegador en http://localhost:3000

// Limpiar localStorage
localStorage.clear();

// Limpiar auth store si está usando Zustand
if (window.zustandAuthStore) {
  window.zustandAuthStore.getState().logout();
}

// Recargar página
window.location.reload();

console.log('✅ Auth storage cleared! Please login again.');
