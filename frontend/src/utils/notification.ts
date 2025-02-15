import { useNotificationStore, NotificationOptions } from '@/stores/notificationStore';

export const showNotification = (options: NotificationOptions) => {
  const notificationStore = useNotificationStore();
  notificationStore.show(options);
};

export const showSuccess = (message: string, description?: string) => {
  showNotification({
    type: 'success',
    message,
    description,
  });
};

export const showError = (message: string, description?: string) => {
  showNotification({
    type: 'error',
    message,
    description,
  });
};

export const showWarning = (message: string, description?: string) => {
  showNotification({
    type: 'warning',
    message,
    description,
  });
};

export const showInfo = (message: string, description?: string) => {
  showNotification({
    type: 'info',
    message,
    description,
  });
}; 