import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, Car, Building } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';
import { RegisterData } from '../types';

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  
  const defaultRole = searchParams.get('role') as 'DRIVER' | 'OWNER' || 'DRIVER';
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData>({
    defaultValues: {
      role: defaultRole
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterData) => {
    setIsLoading(true);
    
    try {
      const response = await authApi.register(data);
      
      if (response.status === 'success' && response.data) {
        login(response.data.user, response.data.accessToken, response.data.refreshToken);
        toast.success('¡Cuenta creada exitosamente!');
        
        // Redirect based on user role
        if (response.data.user.role === 'DRIVER') {
          navigate('/map');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(response.message || 'Error al crear la cuenta');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Cuenta
          </h2>
          <p className="text-gray-600">
            Únete a la comunidad de ParqueoApp
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ¿Cómo vas a usar ParqueoApp?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRole === 'DRIVER' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    value="DRIVER"
                    className="sr-only"
                    {...register('role', { required: 'Selecciona un rol' })}
                  />
                  <div className="flex flex-col items-center text-center">
                    <Car className={`mb-2 ${selectedRole === 'DRIVER' ? 'text-primary-600' : 'text-gray-400'}`} size={24} />
                    <span className={`text-sm font-medium ${selectedRole === 'DRIVER' ? 'text-primary-600' : 'text-gray-600'}`}>
                      Conductor
                    </span>
                  </div>
                </label>
                
                <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRole === 'OWNER' 
                    ? 'border-secondary-500 bg-secondary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    value="OWNER"
                    className="sr-only"
                    {...register('role', { required: 'Selecciona un rol' })}
                  />
                  <div className="flex flex-col items-center text-center">
                    <Building className={`mb-2 ${selectedRole === 'OWNER' ? 'text-secondary-600' : 'text-gray-400'}`} size={24} />
                    <span className={`text-sm font-medium ${selectedRole === 'OWNER' ? 'text-secondary-600' : 'text-gray-600'}`}>
                      Dueño
                    </span>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <input
                id="name"
                type="text"
                className={`input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Tu nombre completo"
                {...register('name', {
                  required: 'El nombre es requerido',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres'
                  }
                })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="tu@email.com"
                {...register('email', {
                  required: 'El correo electrónico es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Ingresa un correo electrónico válido'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Crea una contraseña segura"
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Crear Cuenta</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
