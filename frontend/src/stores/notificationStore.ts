import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notification } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface NotificationOptions {
  message: string;
  description?: string;
  type?: NotificationType;
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

export const useNotificationStore = defineStore('notification', () => {
  const notificationApi = ref<NotificationInstance>();

  function init() {
    notification.init().then(api => {
      notificationApi.value = api;
    });
  }

  function show(options: NotificationOptions) {
    const { message, description, type = 'info', duration = 4.5, placement = 'topRight' } = options;

    if (notificationApi.value) {
      notificationApi.value[type]({
        message,
        description,
        duration,
        placement,
      });
    } else {
      // 降级到普通notification
      notification[type]({
        message,
        description,
        duration,
        placement,
      });
    }
  }

  return {
    init,
    show,
  };
});