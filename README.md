# 🅿️ ParqueoAPP - Sistema de Gestión de Estacionamientos

Una aplicación completa para la gestión de estacionamientos con funcionalidades avanzadas para usuarios y propietarios. Construida con tecnologías modernas y un enfoque en la experiencia del usuario.

## 🌟 Características Principales

**🚀 [Ver Demo Live](http://localhost:3000)** | **📱 Funciona en móvil y desktop**

### Credenciales Demo

- **Email**: `demo@parqueoapp.com`
- **Password**: demo123

---

## 🌟 Características

### Para Usuarios

- **🔐 Autenticación Completa**: Registro, login y recuperación de contraseña
- **📍 Búsqueda de Estacionamientos**: Encuentra estacionamientos cercanos con mapa interactivo
- **📅 Sistema de Reservas**: Reserva espacios con confirmación instantánea
- **💳 Pagos Seguros**: Integración con Stripe para pagos seguros
- **⭐ Sistema de Reseñas**: Califica y comenta tu experiencia
- **🔔 Notificaciones**: Recibe actualizaciones en tiempo real
- **👤 Gestión de Perfil**: Subida de foto, cambio de contraseña, configuración de notificaciones

### Para Propietarios

- **🏢 Dashboard Administrativo**: Panel de control completo
- **📊 Analytics**: Estadísticas de ocupación y ingresos
- **⚙️ Gestión de Espacios**: Administración de estacionamientos y tarifas
- **📈 Reportes**: Historial de transacciones y ocupación

### Características Técnicas

- **⚡ Tiempo Real**: Socket.IO para actualizaciones en vivo
- **🔒 Seguridad**: JWT authentication y bcrypt para contraseñas
- **📁 Subida de Archivos**: Multer para manejo de imágenes
- **🗃️ Base de Datos**: Prisma ORM con MySQL
- **🎨 UI Moderna**: React con Tailwind CSS
- **📱 Responsive**: Diseño adaptable a todos los dispositivos

---

## 🛠️ Stack Tecnológico

### Backend

- **Node.js** + **Express.js**
- **TypeScript** para tipado estático
- **Prisma ORM** con MySQL
- **JWT** para autenticación
- **Socket.IO** para tiempo real
- **Multer** para subida de archivos
- **Stripe** para pagos
- **bcrypt** para hash de contraseñas

### Frontend

- **React 18** + **TypeScript**
- **Tailwind CSS** para estilos
- **Zustand** para estado global
- **React Router** para navegación
- **Lucide React** para iconos
- **React Leaflet** para mapas
- **React Hot Toast** para notificaciones
- **Axios** para peticiones HTTP

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- MySQL
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/parqueo-app.git
cd parqueo-app
```

### 2. Instalar dependencias

```bash
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### 3. Configurar variables de entorno

#### Backend (.env)

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/parqueo_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Server
PORT=5000
NODE_ENV=development

# File Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880
```

#### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Configurar la base de datos

```bash
cd backend

# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# Sembrar datos de prueba (opcional)
npx prisma db seed
```

### 5. Ejecutar la aplicación

```bash
# Desde la raíz del proyecto
npm run dev

# O ejecutar por separado:
# Backend
cd backend && npm run dev

# Frontend (en otra terminal)
cd frontend && npm start
```

La aplicación estará disponible en:

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:5000`

---

## 📡 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Renovar token

### Usuarios

- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `POST /api/users/upload-photo` - Subir foto de perfil
- `PUT /api/users/change-password` - Cambiar contraseña

### Estacionamientos

- `GET /api/parking-lots` - Listar estacionamientos
- `POST /api/parking-lots` - Crear estacionamiento (propietario)
- `PUT /api/parking-lots/:id` - Actualizar estacionamiento
- `DELETE /api/parking-lots/:id` - Eliminar estacionamiento
- `GET /api/parking-lots/search` - Buscar estacionamientos

### Reservas

- `GET /api/bookings` - Listar reservas del usuario
- `POST /api/bookings` - Crear nueva reserva
- `PUT /api/bookings/:id` - Actualizar reserva
- `DELETE /api/bookings/:id` - Cancelar reserva
- `GET /api/bookings/owner` - Reservas del propietario

### Pagos

- `POST /api/payments/create-intent` - Crear intención de pago
- `POST /api/payments/confirm` - Confirmar pago
- `GET /api/payments/history` - Historial de pagos
- `POST /api/payments/refund` - Procesar reembolso

---

## 🚀 Despliegue

### Backend (Railway/Heroku)

1. Configurar variables de entorno
2. Conectar base de datos MySQL
3. Ejecutar migraciones
4. Desplegar aplicación

### Frontend (Vercel/Netlify)

1. Configurar variables de entorno
2. Configurar redirects para SPA
3. Desplegar desde repositorio Git

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Fork del proyecto
2. Crear rama para nueva funcionalidad
3. Hacer commit de los cambios
4. Push a la rama
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 📧 Contacto

- **Desarrollador**: Eduard Barrera
- **Email**: `ing.eduardbarrera@gmail.com`
- **GitHub**: [@eduardbar](https://github.com/eduardbar)

---

## 🙏 Agradecimientos

- React y el ecosistema de React
- Express.js y Node.js
- Prisma ORM
- Tailwind CSS
- Stripe por los pagos seguros
- Socket.IO para tiempo real
