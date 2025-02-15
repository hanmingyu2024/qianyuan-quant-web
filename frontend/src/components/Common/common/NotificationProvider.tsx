import React, { useEffect } from 'react';
import { notification } from 'antd';
import { useNotificationStore } from '@/stores/notificationStore';

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notificationStore = useNotificationStore();

  useEffect(() => {
    notificationStore.init();
  }, []);

  return <>{children}</>;
};

export default NotificationProvider; 