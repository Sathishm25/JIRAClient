import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../pages/Header';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = sessionStorage.getItem('token');
    const userDetails = sessionStorage.getItem('userdetails');
    
    if (!token || !userDetails) {
      // Redirect to sign in if not authenticated
      navigate('/');
    }
  }, [navigate]);

  // Check authentication before rendering
  const token = sessionStorage.getItem('token');
  const userDetails = sessionStorage.getItem('userdetails');
  
  if (!token || !userDetails) {
    return null; // Don't render anything while redirecting
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default ProtectedRoute;