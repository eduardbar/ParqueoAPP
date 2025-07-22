# 🚀 Configuración Detallada en Vercel Dashboard

## 📋 PASO A PASO EN VERCEL.COM

### 1. Project Configuration
```
Project Name: parqueoapp (o el que prefieras)
Framework Preset: Other
Root Directory: ./
Build Command: (automático - usa package.json)
Output Directory: (automático)
Install Command: npm install
```

### 2. Environment Variables (TAB: Settings > Environment Variables)

**Variables OBLIGATORIAS mínimas:**
```
NODE_ENV = production
REACT_APP_API_URL = https://NOMBRE-DE-TU-PROYECTO.vercel.app/api
```

**Variables RECOMENDADAS para funcionalidad completa:**
```
# Base de datos (PlanetScale gratis)
DATABASE_URL = mysql://username:password@host/database_name

# JWT (generar claves únicas)
JWT_SECRET = tu_clave_secreta_de_32_caracteres_o_mas
JWT_REFRESH_SECRET = otra_clave_diferente_para_refresh

# Stripe (TEST keys - gratis)
STRIPE_SECRET_KEY = sk_test_51xxxxxxxxxx
REACT_APP_STRIPE_PUBLISHABLE_KEY = pk_test_xxxxxxxxxx

# CORS
CORS_ORIGIN = https://NOMBRE-DE-TU-PROYECTO.vercel.app
```

### 3. Build Settings
```
Build Command: npm run build
Output Directory: frontend/build
Install Command: npm install
Node.js Version: 18.x
```

### 4. Functions Configuration
```
Function Region: Washington D.C. (iad1) - más rápido para LATAM
Serverless Function Timeout: 30 seconds (gratis incluye hasta 60s)
```

## 🎯 CONFIGURACIÓN OPTIMIZADA

### Para el BUILD de frontend:
Asegúrate que `frontend/package.json` tenga:
```json
{
  "scripts": {
    "build": "react-scripts build",
    "postbuild": "echo 'Build completed successfully'"
  }
}
```

### Para el API del backend:
El archivo `backend/src/index.ts` debe exportar como serverless function:
```typescript
// Al final del archivo
export default app; // Para Vercel
```

## ⚡ DEPLOY INMEDIATO (SIN BASE DE DATOS)

Si quieres ver la app funcionando YA, usa solo estas variables:
```
NODE_ENV = production
REACT_APP_API_URL = https://tu-proyecto.vercel.app/api
```

La app funcionará en modo "demo" sin necesidad de configurar base de datos ni Stripe.

## 🔄 PROCESO DE DEPLOY

1. **Haz clic en "Deploy"** en Vercel
2. **Espera 2-3 minutos** para el build automático
3. **Copia tu URL final**: https://parqueoapp-xxx.vercel.app
4. **Actualiza REACT_APP_API_URL** con tu URL real
5. **Redeploy automático** en 30 segundos

## ✅ VERIFICACIÓN POST-DEPLOY

Prueba estas URLs después del deploy:
- `https://tu-proyecto.vercel.app` → Frontend React
- `https://tu-proyecto.vercel.app/api/health` → Backend API
- `https://tu-proyecto.vercel.app/api/test` → Test endpoint

## 🆘 TROUBLESHOOTING

**Error de build?**
- Verifica que todas las dependencies estén en package.json
- Asegúrate que no hay errores de TypeScript

**API no funciona?**
- Verifica que las environment variables estén configuradas
- Revisa los logs en Vercel Dashboard > Functions

**Frontend en blanco?**
- Verifica que REACT_APP_API_URL esté configurado
- Revisa la consola del navegador para errores
