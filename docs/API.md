# API Documentation - ParqueoApp

## Base URL
```
http://localhost:5000/api
```

## Authentication
La mayoría de endpoints requieren autenticación JWT. Incluye el token en el header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Registrar un nuevo usuario.

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "role": "USER" // o "OWNER"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "USER"
  },
  "token": "jwt_token_here"
}
```

#### POST /auth/login
Iniciar sesión.

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "USER"
  },
  "token": "jwt_token_here"
}
```

### Users Profile

#### GET /users/profile
Obtener perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "USER",
    "profileImage": "/uploads/profiles/profile-123456.jpg",
    "notificationSettings": {
      "emailNotifications": true,
      "pushNotifications": true,
      "smsNotifications": false
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /users/profile
Actualizar perfil del usuario.

**Request Body:**
```json
{
  "name": "Juan Carlos Pérez",
  "email": "juan.carlos@example.com"
}
```

#### POST /users/profile/upload-image
Subir imagen de perfil.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `profileImage`: archivo de imagen (max 5MB, jpeg/jpg/png/gif)

#### PUT /users/profile/change-password
Cambiar contraseña.

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### PUT /users/profile/notification-settings
Actualizar configuración de notificaciones.

**Request Body:**
```json
{
  "emailNotifications": true,
  "pushNotifications": false,
  "smsNotifications": true
}
```

### Parking Lots

#### GET /parking-lots
Listar estacionamientos.

**Query Parameters:**
- `lat`: latitud (opcional)
- `lng`: longitud (opcional)
- `radius`: radio en km (opcional, default: 5)

**Response:**
```json
{
  "parkingLots": [
    {
      "id": 1,
      "name": "Estacionamiento Centro",
      "address": "Calle Principal 123",
      "latitude": -12.0464,
      "longitude": -77.0428,
      "hourlyRate": 5.00,
      "totalSpaces": 50,
      "availableSpaces": 25,
      "amenities": ["security", "covered"],
      "ownerId": 2,
      "owner": {
        "name": "María García",
        "email": "maria@example.com"
      }
    }
  ]
}
```

#### POST /parking-lots
Crear nuevo estacionamiento (solo OWNER).

**Request Body:**
```json
{
  "name": "Mi Estacionamiento",
  "address": "Av. Los Olivos 456",
  "latitude": -12.0500,
  "longitude": -77.0400,
  "hourlyRate": 8.00,
  "totalSpaces": 30,
  "amenities": ["security", "covered", "electric_charging"]
}
```

### Bookings

#### GET /bookings
Listar reservas del usuario autenticado.

**Response:**
```json
{
  "bookings": [
    {
      "id": 1,
      "startTime": "2024-01-15T10:00:00.000Z",
      "endTime": "2024-01-15T14:00:00.000Z",
      "totalAmount": 20.00,
      "status": "ACTIVE",
      "parkingLot": {
        "name": "Estacionamiento Centro",
        "address": "Calle Principal 123"
      }
    }
  ]
}
```

#### POST /bookings
Crear nueva reserva.

**Request Body:**
```json
{
  "parkingLotId": 1,
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T14:00:00.000Z"
}
```

### Payments

#### POST /payments/create-intent
Crear intención de pago con Stripe.

**Request Body:**
```json
{
  "bookingId": 1,
  "amount": 20.00
}
```

**Response:**
```json
{
  "clientSecret": "pi_1234567890_secret_abcdefg",
  "paymentIntentId": "pi_1234567890"
}
```

#### GET /payments/history
Obtener historial de pagos.

**Response:**
```json
{
  "payments": [
    {
      "id": 1,
      "amount": 20.00,
      "status": "succeeded",
      "stripePaymentIntentId": "pi_1234567890",
      "createdAt": "2024-01-15T14:00:00.000Z",
      "booking": {
        "id": 1,
        "parkingLot": {
          "name": "Estacionamiento Centro"
        }
      }
    }
  ]
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

### Events

#### Client to Server
- `join-parking-lot`: `{ parkingLotId: 1 }`
- `leave-parking-lot`: `{ parkingLotId: 1 }`

#### Server to Client
- `parking-lot-updated`: Actualización de espacios disponibles
- `booking-created`: Nueva reserva creada
- `booking-cancelled`: Reserva cancelada
- `notification`: Notificación general

## Error Responses

Todos los endpoints pueden retornar estos errores:

### 400 Bad Request
```json
{
  "error": "Mensaje de error específico"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Access token required"
}
```

### 404 Not Found
```json
{
  "error": "Recurso no encontrado"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error interno del servidor"
}
```
