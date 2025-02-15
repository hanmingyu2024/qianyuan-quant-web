import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import Dashboard from '@/pages/Dashboard';
import StrategyList from '@/pages/Strategy/StrategyList';
import ManualTrading from '@/pages/Trading/ManualTrading';
import AutoTrading from '@/pages/Trading/AutoTrading';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate replace to="/login" />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <Dashboard /> },
          { path: '/strategy', element: <StrategyList /> },
          { path: '/trading/manual', element: <ManualTrading /> },
          { path: '/trading/auto', element: <AutoTrading /> },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
]);