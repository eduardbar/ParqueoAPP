import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  // const { isAuthenticated } = useAuthStore();
  
  // Pages where we don't want to show the header
  const hideHeaderPaths = ['/login', '/register'];
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowHeader && <Header />}
      <main className={shouldShowHeader ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
