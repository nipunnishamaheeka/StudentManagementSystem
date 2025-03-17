import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { authState } = useContext(AuthContext);
  
  if (authState.loading) {
    return <div>Loading...</div>;
  }
  
  return authState.isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;