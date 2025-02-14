# config/config_manager.py

import yaml
import os
from typing import Dict
from pathlib import Path

class ConfigManager:
    def __init__(self):
        self.config = self.load_config()
        
    def load_config(self) -> Dict:
        """加载配置文件"""
        env = os.getenv('ENV', 'development')
        base_path = Path(__file__).parent
        
        # 加载基础配置
        base_config = self._load_yaml(base_path / 'base.yml')
        
        # 加载环境配置
        env_config = self._load_yaml(base_path / f'{env}.yml')
        
        # 合并配置
        self._merge_config(base_config, env_config)
        
        # 环境变量覆盖
        self._override_from_env(base_config)
        
        return base_config
    
    def _load_yaml(self, path: Path) -> Dict:
        """加载YAML文件"""
        try:
            with path.open('r', encoding='utf-8') as f:
                return yaml.safe_load(f) or {}
        except Exception as e:
            print(f"加载配置文件失败 {path}: {str(e)}")
            return {}
            
    def _merge_config(self, base: Dict, override: Dict):
        """递归合并配置"""
        for key, value in override.items():
            if isinstance(value, dict) and key in base:
                self._merge_config(base[key], value)
            else:
                base[key] = value
                
    def _override_from_env(self, config: Dict, prefix: str = ''):
        """从环境变量覆盖配置"""
        for key, value in config.items():
            env_key = f"{prefix}_{key}".upper().strip('_')
            if isinstance(value, dict):
                self._override_from_env(value, env_key)
            elif os.getenv(env_key):
                config[key] = os.getenv(env_key)
                
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
