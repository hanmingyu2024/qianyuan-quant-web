import yaml
import os
from typing import Dict, Any
import logging
from pathlib import Path

class ConfigManager:
    def __init__(self, config_path: str = 'config'):
        self.config_path = Path(config_path)
        self.logger = logging.getLogger(__name__)
        self.config = {}
        self.load_config()

    def load_config(self):
        """加载配置文件"""
        try:
            # 加载基础配置
            base_config = self._load_yaml('base.yml')
            
            # 加载环境特定配置
            env = os.getenv('ENVIRONMENT', 'development')
            env_config = self._load_yaml(f'{env}.yml')
            
            # 合并配置
            self.config = self._merge_configs(base_config, env_config)
            
            # 使用环境变量覆盖配置
            self._override_from_env()
            
        except Exception as e:
            self.logger.error(f"Error loading config: {str(e)}")
            raise

    def _load_yaml(self, filename: str) -> Dict:
        """加载YAML文件"""
        file_path = self.config_path / filename
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        return {}

    def _merge_configs(self, base: Dict, override: Dict) -> Dict:
        """递归合并配置字典"""
        merged = base.copy()
        
        for key, value in override.items():
            if (
                key in merged and 
                isinstance(merged[key], dict) and 
                isinstance(value, dict)
            ):
                merged[key] = self._merge_configs(merged[key], value)
            else:
                merged[key] = value
                
        return merged

    def _override_from_env(self):
        """使用环境变量覆盖配置"""
        for key, value in os.environ.items():
            if key.startswith('APP_'):
                config_key = key[4:].lower()
                self._set_nested_value(self.config, config_key.split('_'), value)

    def _set_nested_value(self, d: Dict, keys: list, value: Any):
        """设置嵌套字典的值"""
        for key in keys[:-1]:
            d = d.setdefault(key, {})
        d[keys[-1]] = value

    def get(self, key: str, default: Any = None) -> Any:
        """获取配置值"""
        try:
            value = self.config
            for k in key.split('.'):
                value = value[k]
            return value
        except (KeyError, TypeError):
            return default

    def set(self, key: str, value: Any):
        """设置配置值"""
        try:
            keys = key.split('.')
            self._set_nested_value(self.config, keys, value)
            
            # 保存到配置文件
            env = os.getenv('ENVIRONMENT', 'development')
            config_file = self.config_path / f'{env}.yml'
            
            with open(config_file, 'w', encoding='utf-8') as f:
                yaml.dump(self.config, f)
                
        except Exception as e:
            self.logger.error(f"Error setting config value: {str(e)}")
            raise

    def validate_config(self) -> bool:
        """验证配置完整性"""
        required_keys = [
            'database.url',
            'redis.url',
            'api.secret_key',
            'email.smtp_server',
            'trading.exchange_api_key'
        ]
        
        for key in required_keys:
            if not self.get(key):
                self.logger.error(f"Missing required config key: {key}")
                return False
                
        return True 