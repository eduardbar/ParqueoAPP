// Este archivo fuerza a TypeScript a reconocer todos los módulos del proyecto
// Puede ser eliminado después de que VS Code reconozca correctamente los módulos

// Importaciones forzadas para resolver falsos positivos
import './middleware/notFoundHandler';
import './routes/users';
import './routes/parking';
import './routes/bookings';
import './routes/reviews';
import './routes/search';
import './routes/auth';
import './routes/paymentRoutes';
import './services/PaymentService';
import './services/ReviewService';
import './services/SearchService';
import './services/notificationService';

// Este archivo será eliminado una vez que VS Code reconozca correctamente los módulos
export {};
