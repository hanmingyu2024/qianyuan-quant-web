import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Home from './pages/Home'
import Market from './pages/Market'
import Trading from './pages/Trading'
import Assets from './pages/Assets'
import Settings from './pages/Settings'
import Help from './pages/Help'
import MainLayout from './components/Layout'
import Login from './pages/Login'
import { marketWS } from '@/services/websocket'
import { orderWS } from '@/services/orderWebsocket'
import { useUserStore } from '@/store/useUserStore'
import React from 'react'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useUserStore((state) => state.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

const App: React.FC = () => {
  React.useEffect(() => {
    // 初始化 WebSocket 连接
    marketWS.connect()
    orderWS.connect()
  }, [])

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/market" element={<Market />} />
                    <Route path="/trading" element={<Trading />} />
                    <Route path="/assets" element={<Assets />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<Help />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App 