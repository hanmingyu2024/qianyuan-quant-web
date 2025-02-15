import React from 'react';
import { Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useThemeStore } from '@/stores/themeStore';
import styled from 'styled-components';

const StyledSwitch = styled(Switch)`
  &.ant-switch-checked {
    background-color: #1890ff;
  }
`;

const ThemeSwitch: React.FC = () => {
  const themeStore = useThemeStore();

  return (
    <StyledSwitch
      checkedChildren={<BulbFilled />}
      unCheckedChildren={<BulbOutlined />}
      checked={themeStore.mode === 'dark'}
      onChange={() => themeStore.toggleTheme()}
    />
  );
};

export default ThemeSwitch; 