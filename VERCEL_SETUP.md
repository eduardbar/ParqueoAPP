# 🔧 Variables de Entorno para Vercel - ParqueoAPP

## ⚠️ IMPORTANTE: Agregar estas variables en Vercel Dashboard

### 📍 FRONTEND (Environment Variables en Vercel)
```bash
# URL del API (se autocompletará después del primer deploy)
REACT_APP_API_URL=https://tu-proyecto.vercel.app/api

# Stripe (usar claves de TEST para empezar)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51...

# Socket.IO (mismo dominio que API)
REACT_APP_SOCKET_URL=https://tu-proyecto.vercel.app
```

### 🗄️ BASE DE DATOS (Environment Variables en Vercel)
```bash
# PlanetScale (100% gratis) - https://planetscale.com
DATABASE_URL=mysql://usuario:contraseña@host/database

# O Railway (gratis) - https://railway.app  
DATABASE_URL=mysql://root:contraseña@containers-us-west-123.railway.app:1234/railway
```

### 🔐 SEGURIDAD (Environment Variables en Vercel)
```bash
# Generar claves seguras (puedes usar: openssl rand -base64 32)
JWT_SECRET=tu_clave_super_segura_aqui_32_caracteres_minimo
JWT_REFRESH_SECRET=otra_clave_diferente_para_refresh_tokens

# Configuración básica
NODE_ENV=production
PORT=5000

# CORS (se autocompleta con tu dominio de Vercel)
CORS_ORIGIN=https://tu-proyecto.vercel.app
```

### 💳 STRIPE (Environment Variables en Vercel)
```bash
# Usar claves de TEST para desarrollo (gratis)
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Para producción real, cambiar a claves LIVE
```

## 🎯 SERVICIOS GRATUITOS RECOMENDADOS

### 1. Base de Datos: PlanetScale (Gratis)
- Ve a https://planetscale.com
- Crea cuenta gratis
- Crea database "parqueoapp"
- Copia la DATABASE_URL

### 2. Stripe: Modo Test (Gratis)
- Ve a https://stripe.com
- Crea cuenta de desarrollador
- Usa las claves de TEST (ilimitado gratis)

### 3. Vercel: Hosting (Gratis)
- Plan Hobby completamente gratis
- Dominio incluido: tu-proyecto.vercel.app
- 100GB bandwidth mensual

## 📝 ORDEN DE CONFIGURACIÓN

1. **Primero**: Configura base de datos (PlanetScale)
2. **Segundo**: Crea cuenta Stripe y obtén claves TEST
3. **Tercero**: Agrega variables en Vercel
4. **Cuarto**: Haz el deploy
5. **Quinto**: Actualiza REACT_APP_API_URL con tu dominio final

## ⚡ DEPLOY RÁPIDO

Si quieres empezar rápido SIN base de datos:
- Comenta las rutas que requieren DB
- Usa solo las funcionalidades frontend
- Agrega DB después

Variables mínimas para deploy inmediato:
```bash
NODE_ENV=production
REACT_APP_API_URL=https://tu-proyecto.vercel.app/api
```
