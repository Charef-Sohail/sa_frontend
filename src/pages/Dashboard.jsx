import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function Dashboard() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Bienvenue {user?.firstName} !</p>
      <p>Cette page est protégée et accessible uniquement après connexion.</p>
    </div>
  );
}

export default Dashboard;