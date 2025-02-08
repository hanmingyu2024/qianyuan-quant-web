# config/config_manager.py

import yaml

def load_config(config_file):
    with open(config_file, 'r') as f:
        return yaml.safe_load(f)

config = load_config('config/base.yml')
print(config)
