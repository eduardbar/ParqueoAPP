# 🧪 USUARIOS DE PRUEBA - PARQUEO APP

## 🔐 Credenciales de Acceso

**Contraseña para TODOS los usuarios:** `password123`

---

## 👥 PROPIETARIOS (OWNERS)
*Usuarios que pueden crear y gestionar estacionamientos*

| Nombre | Email | Rol |
|--------|-------|-----|
| Carlos Mendoza | carlos@parqueoapp.com | OWNER |
| Maria Rodriguez | maria.rodriguez@gmail.com | OWNER |
| Roberto Silva | roberto.silva@yahoo.com | OWNER |
| Ana Gutierrez | ana.gutierrez@hotmail.com | OWNER |
| Jose Martinez | jose.martinez@gmail.com | OWNER |

---

## 🚗 CONDUCTORES (DRIVERS)
*Usuarios regulares que pueden reservar estacionamientos*

| Nombre | Email | Rol |
|--------|-------|-----|
| Juan Perez | juan.perez@gmail.com | DRIVER |
| Sofia Ramirez | sofia.ramirez@yahoo.com | DRIVER |
| Diego Morales | diego.morales@hotmail.com | DRIVER |
| Valentina Cruz | valentina.cruz@gmail.com | DRIVER |
| Mateo Fernandez | mateo.fernandez@outlook.com | DRIVER |
| Isabella Lopez | isabella.lopez@gmail.com | DRIVER |
| Sebastian Torres | sebastian.torres@yahoo.com | DRIVER |
| Camila Vargas | camila.vargas@hotmail.com | DRIVER |
| Nicolas Herrera | nicolas.herrera@gmail.com | DRIVER |
| Lucia Castillo | lucia.castillo@outlook.com | DRIVER |
| Daniel Jimenez | daniel.jimenez@yahoo.com | DRIVER |
| Gabriela Ruiz | gabriela.ruiz@gmail.com | DRIVER |
| Alejandro Medina | alejandro.medina@hotmail.com | DRIVER |
| Fernanda Ortiz | fernanda.ortiz@gmail.com | DRIVER |
| Ricardo Delgado | ricardo.delgado@yahoo.com | DRIVER |

---

## 🅿️ ESTACIONAMIENTOS DE PRUEBA

Los siguientes estacionamientos serán creados automáticamente:

1. **Centro Comercial Plaza Norte** - Los Olivos
2. **Parqueo Miraflores Centro** - Miraflores  
3. **Estacionamiento San Isidro Business** - San Isidro
4. **Parqueo Barranco Artístico** - Barranco
5. **Mega Plaza Parqueo Norte** - Independencia
6. **Parqueo Corporativo La Molina** - La Molina
7. **Parqueo Universitario PUCP** - San Miguel
8. **Estacionamiento Callao Puerto** - Callao
9. **Parqueo Surco Residencial** - Surco
10. **Parqueo Aeropuerto Jorge Chávez** - Callao

---

## 📋 COMANDOS PARA EJECUTAR

### 1. Crear solo usuarios:
```bash
npx tsx src/scripts/seedUsers.ts
```

### 2. Crear solo estacionamientos:
```bash
npx tsx src/scripts/seedParkingLots.ts
```

### 3. Crear reservas de prueba:
```bash
npx tsx src/scripts/seedBookings.ts
```

### 4. Ejecutar todos los scripts:
```bash
npx tsx src/scripts/seedUsers.ts
npx tsx src/scripts/seedParkingLots.ts
npx tsx src/scripts/seedBookings.ts
```

---

## 📊 DATOS YA CREADOS

✅ **20 usuarios** (5 propietarios + 15 conductores)
✅ **10 estacionamientos** distribuidos en Lima
✅ **10 reservas** con diferentes estados
✅ **Contraseña única** para todos: `password123`

---

## 🎯 ESCENARIOS DE PRUEBA DISPONIBLES

### 📱 Reservas por Estado:
- **PENDING** ⏳ - 1 reserva pendiente
- **CONFIRMED** ✅ - 2 reservas confirmadas  
- **ACTIVE** 🅿️ - 1 reserva activa
- **COMPLETED** ✅ - 2 reservas completadas
- **PAID** 💰 - 3 reservas pagadas
- **CANCELLED** ❌ - 1 reserva cancelada

---

## 🔧 ESCENARIOS DE PRUEBA RECOMENDADOS

### Para Propietarios (OWNERS):
1. Login con `carlos@parqueoapp.com`
2. Crear nuevo estacionamiento
3. Gestionar espacios disponibles
4. Ver estadísticas de ganancias
5. Gestionar reservas

### Para Conductores (DRIVERS):
1. Login con `juan.perez@gmail.com`
2. Buscar estacionamientos cercanos
3. Hacer una reserva
4. Procesar pago
5. Calificar estacionamiento

### Pruebas de Integración:
- Notificaciones en tiempo real
- Pagos con Stripe (usar tarjetas de prueba)
- Geolocalización
- Búsqueda avanzada
- Sistema de reseñas

---

## 💳 TARJETAS DE PRUEBA STRIPE

Para pruebas de pago, usar:
- **Visa exitosa:** 4242 4242 4242 4242
- **Mastercard exitosa:** 5555 5555 5555 4444
- **Tarjeta rechazada:** 4000 0000 0000 0002
- **CVV:** Cualquier 3 dígitos
- **Fecha:** Cualquier fecha futura

---

## 🚀 PRÓXIMOS PASOS

1. Ejecutar los scripts de seeding
2. Verificar la creación de datos en la base de datos
3. Probar el login con diferentes roles
4. Validar funcionalidades específicas por rol
5. Realizar pruebas de extremo a extremo

¡Listo para probar la aplicación! 🎉
