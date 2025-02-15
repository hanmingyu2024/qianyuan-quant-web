import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLocaleStore, LocaleType } from '@/stores/localeStore';
import styled from 'styled-components';

const { Option } = Select;

const StyledSelect = styled(Select)`
  width: 120px;
`;

const LocaleSelect: React.FC = () => {
  const localeStore = useLocaleStore();

  const handleChange = (value: LocaleType) => {
    localeStore.setLocale(value);
  };

  return (
    <StyledSelect
      value={localeStore.currentLocale}
      onChange={handleChange}
      prefix={<GlobalOutlined />}
    >
      <Option value="zh-CN">简体中文</Option>
      <Option value="en-US">English</Option>
    </StyledSelect>
  );
};

export default LocaleSelect; 