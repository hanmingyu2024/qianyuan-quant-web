# config/config_manager.py

import yaml
import os
from typing import Dict

class ConfigManager:
    def __init__(self):
        self.config = self.load_config()
        
    def load_config(self) -> Dict:
        """加载配置文件"""
        env = os.getenv('ENV', 'development')
        config_path = os.path.join(
            os.path.dirname(__file__),
            f'{env}.yml'
        )
        
        # 默认配置
        default_config = {
            'database': {
                'url': 'sqlite:///./quant.db',
                'pool_size': 20,
                'max_overflow': 0
            },
            'redis': {
                'host': 'localhost',
                'port': 6379
            },
            'market_data': {
                'websocket_url': 'wss://api.example.com/ws'
            }
        }
        
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                loaded_config = yaml.safe_load(f)
                # 合并配置
                self._merge_config(default_config, loaded_config)
                return default_config
        except Exception as e:
            print(f"加载配置文件失败: {str(e)}")
            return default_config
            
    def _merge_config(self, default: Dict, override: Dict):
        """合并配置"""
        for key, value in override.items():
            if key in default and isinstance(default[key], dict) and isinstance(value, dict):
                self._merge_config(default[key], value)
            else:
                default[key] = value
                
    def get(self, key: str, default=None):
        """获取配置值"""
        try:
            keys = key.split('.')
            value = self.config
            for k in keys:
                value = value[k]
            return value
        except (KeyError, TypeError):
            return default
