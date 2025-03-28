import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Building, MapPin, Clock, DollarSign, Shield } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              🅿️ Encuentra tu <span className="text-primary-600">Estacionamiento</span> Perfecto
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Conectamos conductores con estacionamientos disponibles en tiempo real. 
              Ahorra tiempo, dinero y evita el estrés de buscar donde aparcar.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                to="/register?role=DRIVER" 
                className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
              >
                <Car size={24} />
                <span>Soy Conductor</span>
              </Link>
              <Link 
                to="/register?role=OWNER" 
                className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
              >
                <Building size={24} />
                <span>Soy Dueño de Estacionamiento</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            ¿Por qué elegir ParqueoApp?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ubicación en Tiempo Real</h3>
              <p className="text-gray-600">
                Encuentra estacionamientos cerca de ti con disponibilidad actualizada al instante
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="text-secondary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ahorra Tiempo</h3>
              <p className="text-gray-600">
                No más vueltas buscando estacionamiento. Ve directamente al lugar disponible
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-accent-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Precios Transparentes</h3>
              <p className="text-gray-600">
                Compara precios y encuentra la mejor opción para tu bolsillo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            ¿Cómo funciona?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-16">
            {/* For Drivers */}
            <div>
              <h3 className="text-2xl font-bold text-primary-600 mb-8 flex items-center">
                <Car className="mr-3" size={28} />
                Para Conductores
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Regístrate como conductor</h4>
                    <p className="text-gray-600">Crea tu cuenta gratuita en segundos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Busca estacionamientos</h4>
                    <p className="text-gray-600">Ve los disponibles cerca de tu ubicación</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Navega y estaciona</h4>
                    <p className="text-gray-600">Obtén direcciones y llega directo al lugar</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* For Owners */}
            <div>
              <h3 className="text-2xl font-bold text-secondary-600 mb-8 flex items-center">
                <Building className="mr-3" size={28} />
                Para Dueños
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-secondary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Registra tu estacionamiento</h4>
                    <p className="text-gray-600">Agrega ubicación, precios y horarios</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-secondary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Actualiza disponibilidad</h4>
                    <p className="text-gray-600">Mantén la información actualizada en tiempo real</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-secondary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Maximiza ganancias</h4>
                    <p className="text-gray-600">Atrae más clientes y optimiza tu ocupación</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Únete a la revolución del estacionamiento inteligente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-md font-medium text-lg transition-colors"
            >
              Crear Cuenta Gratuita
            </Link>
            <Link 
              to="/login" 
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-md font-medium text-lg transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
