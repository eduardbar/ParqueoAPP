# Configuración para Producción - Vercel

## Configuración aplicada para https://parqueo-app-col.vercel.app/

### 🎯 Cambios principales realizados:

1. **URLs del API**: Configuradas para apuntar al dominio completo de Vercel
2. **CORS**: Configuración específica para el dominio de producción
3. **Variables de entorno**: Configuradas para producción
4. **Funciones serverless**: Optimizadas según documentación de Vercel

### 📋 URLs configuradas:

- **Frontend**: `https://parqueo-app-col.vercel.app/`
- **API**: `https://parqueo-app-col.vercel.app/api/`
- **WebSockets**: `https://parqueo-app-col.vercel.app/`

### 🔧 Archivos modificados:

- `frontend/src/services/authService.ts` - URLs del API
- `frontend/src/config/api.ts` - Configuración centralizada
- `vercel.json` - Headers CORS y configuración de deployment
- `api/auth/*.ts` - Headers CORS específicos del dominio
- `api/users/profile.ts` - Headers CORS
- `frontend/.env.production` - Variables de entorno de producción

### 🚀 Para hacer deploy:

```bash
# Desde la raíz del proyecto
vercel --prod
```

### 🧪 Para probar la configuración CORS:

```bash
# Ejecutar el script de pruebas
bash test-cors.sh
```

### 📡 Endpoints de la API:

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/refresh` - Renovar token
- `GET /api/users/profile` - Obtener perfil de usuario

### 🔍 Verificación de CORS:

La configuración CORS está configurada para:
- **Origen permitido**: `https://parqueo-app-col.vercel.app`
- **Métodos**: `GET, POST, PUT, DELETE, OPTIONS`
- **Headers**: `Content-Type, Authorization, X-Requested-With`
- **Credentials**: `true`
- **Max Age**: `86400` segundos (24 horas)

### 🐛 Troubleshooting:

Si encuentras errores CORS, verifica:
1. Que el dominio en `vercel.json` coincida con el deployment
2. Que las variables de entorno estén configuradas correctamente
3. Que los headers CORS estén presentes en la respuesta del servidor
