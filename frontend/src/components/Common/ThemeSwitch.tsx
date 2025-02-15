import React from 'react';
import { Switch } from 'antd';
import { useTheme } from '@/hooks/useTheme';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const StyledSwitch = styled(Switch)`
  &.ant-switch-checked {
    background: #177ddc;
  }
`;

const ThemeSwitch: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <StyledSwitch
      checked={isDarkMode}
      onChange={toggleTheme}
      checkedChildren={<MoonOutlined />}
      unCheckedChildren={<SunOutlined />}
    />
  );
};

export default ThemeSwitch; 