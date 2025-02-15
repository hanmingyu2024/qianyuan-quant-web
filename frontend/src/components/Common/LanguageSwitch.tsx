import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { GlobalOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Option } = Select;

const StyledSelect = styled(Select)`
  min-width: 120px;
  .ant-select-selector {
    border-radius: 20px !important;
  }
`;

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

const LanguageSwitch: React.FC = () => {
  const { i18n } = useTranslation();

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <StyledSelect
      value={i18n.language}
      onChange={handleChange}
      suffixIcon={<GlobalOutlined />}
      dropdownMatchSelectWidth={false}
    >
      {languages.map(({ code, name, flag }) => (
        <Option key={code} value={code}>
          {flag} {name}
        </Option>
      ))}
    </StyledSelect>
  );
};

export default LanguageSwitch; 