import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Market from '@/pages/Market';
import Trading from '@/pages/Trading';
import Assets from '@/pages/Assets';
import Strategy from '@/pages/Strategy';
import Backtest from '@/pages/Backtest';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Market /> },
      { path: '/trading', element: <Trading /> },
      { path: '/assets', element: <Assets /> },
      { path: '/strategy', element: <Strategy /> },
      { path: '/backtest', element: <Backtest /> },
    ],
  },
]); 