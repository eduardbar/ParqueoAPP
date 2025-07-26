import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Pages where we don't want to show the header
  const hideHeaderPaths = ['/login', '/register'];
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Maintenance Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                🚧 <strong>Modo Mantenimiento:</strong> La aplicación está configurándose. Algunas funcionalidades pueden no estar disponibles temporalmente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {shouldShowHeader && <Header />}
      <main className={shouldShowHeader ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
