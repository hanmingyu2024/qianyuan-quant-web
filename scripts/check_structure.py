#!/usr/bin/env python3
import os
import sys
from typing import Dict, List, Set
import yaml
import importlib.util
import logging
from colorama import init, Fore, Style
from concurrent.futures import ThreadPoolExecutor
from importlib.metadata import version, PackageNotFoundError
from cerberus import Validator

# 初始化颜色输出
init()

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s]: %(message)s',
    handlers=[
        logging.FileHandler("project_structure.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class ProjectStructureChecker:
    def __init__(self):
        self.root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.required_structure = {
            'backend': {
                'api': ['__init__.py', 'auth.py', 'strategies.py', 'trades.py', 'users.py'],
                'models': ['__init__.py', 'database.py'],
                'services': [
                    '__init__.py',
                    'auth_service.py',
                    'market_data_service.py',
                    'execution_engine.py',
                    'risk_control_service.py',
                    'analysis_service.py',
                    'report_service.py',
                    'notification_service.py',
                    'websocket_service.py'
                ],
                'strategy': ['__init__.py', 'backtest_template.py'],
                'utils': ['__init__.py', 'api_docs_generator.py'],
                '__init__.py': None,
                'main.py': None
            },
            'config': {
                '__init__.py': None,
                'base.yml': None,
                'development.yml': None,
                'production.yml': None,
                'config_manager.py': None
            },
            'deploy': {
                'docker-compose.yml': None,
                'Dockerfile.backend': None,
                'Dockerfile.websocket': None,
                'prometheus.yml': None
            },
            'docs': {
                'DEPLOYMENT.md': None,
                'DEVELOPMENT.md': None,
                'API.md': None
            },
            'scripts': {
                'create_admin.py': None,
                'backup_db.sh': None,
                'check_structure.py': None
            },
            'tests': {
                '__init__.py': None,
                'test_auth.py': None,
                'test_strategies.py': None,
                'test_trades.py': None
            },
            '.env.example': None,
            '.gitignore': None,
            'LICENSE': None,
            'README.md': None,
            'requirements.txt': None
        }
        
        self.python_files: Set[str] = set()
        self.issues: List[str] = []
        self.warnings: List[str] = []

    def check_structure(self) -> bool:
        logger.info(f"{Fore.BLUE}开始检查项目结构...{Style.RESET_ALL}")
        is_valid = True
        for path, expected in self._walk_required_structure(self.required_structure):
            full_path = os.path.join(self.root_dir, path)
            
            if not os.path.exists(full_path):
                self.issues.append(f"缺少文件/目录: {path}")
                is_valid = False
                continue
                
            if expected is not None and os.path.isdir(full_path):
                for file in expected:
                    file_path = os.path.join(full_path, file)
                    if not os.path.exists(file_path):
                        self.issues.append(f"缺少文件: {os.path.join(path, file)}")
                        is_valid = False
                    elif file.endswith('.py'):
                        self.python_files.add(file_path)
        
        return is_valid

    def check_python_imports(self) -> bool:
        logger.info(f"{Fore.BLUE}检查Python文件导入...{Style.RESET_ALL}")
        
        is_valid = True

        def validate_import(file_path: str) -> bool:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                compile(content, file_path, 'exec')
                return True
            except SyntaxError as e:
                self.issues.append(f"语法错误 in {file_path}: {str(e)}")
                return False

        with ThreadPoolExecutor() as executor:
            results = list(executor.map(validate_import, self.python_files))
        return all(results)

    def check_yaml_files(self) -> bool:
        logger.info(f"{Fore.BLUE}检查YAML文件...{Style.RESET_ALL}")
        
        schema = {
            'app_name': {'type': 'string', 'required': True},
            'database': {
                'type': 'dict',
                'schema': {
                    'host': {'type': 'string', 'required': True},
                    'port': {'type': 'integer', 'required': True}
                }
            }
        }
        
        v = Validator(schema)
        is_valid = True
        yaml_files = ['config/base.yml', 'config/development.yml', 'config/production.yml']

        for yaml_file in yaml_files:
            full_path = os.path.join(self.root_dir, yaml_file)
            if os.path.exists(full_path):
                with open(full_path, 'r', encoding='utf-8') as f:
                    try:
                        data = yaml.safe_load(f)
                        if not v.validate(data):
                            self.issues.append(f"{yaml_file} 结构错误: {v.errors}")
                            is_valid = False
                    except yaml.YAMLError as e:
                        self.issues.append(f"YAML语法错误 in {yaml_file}: {str(e)}")
                        is_valid = False
        return is_valid

    def check_requirements(self) -> bool:
        logger.info(f"{Fore.BLUE}检查requirements.txt...{Style.RESET_ALL}")
        
        req_path = os.path.join(self.root_dir, 'requirements.txt')
        if not os.path.exists(req_path):
            self.issues.append("缺少requirements.txt文件")
            return False
            
        try:
            with open(req_path, 'r', encoding='utf-8') as f:
                requirements = f.readlines()

            if not requirements:
                self.warnings.append("requirements.txt为空")

            for req in requirements:
                req = req.strip()
                if req and not req.startswith('#'):
                    try:
                        version(req)
                    except PackageNotFoundError:
                        self.issues.append(f"无法找到依赖项: {req}")
                    if '==' not in req and '>=' not in req and '<=' not in req:
                        self.warnings.append(f"建议为依赖项指定版本: {req}")

        except Exception as e:
            self.issues.append(f"检查requirements.txt时出错: {str(e)}")
            return False
            
        return True

    def _walk_required_structure(self, structure: Dict, parent_path: str = '') -> List[tuple]:
        result = []
        for name, expected in structure.items():
            current_path = os.path.join(parent_path, name) if parent_path else name
            result.append((current_path, expected))
            if isinstance(expected, dict):
                result.extend(self._walk_required_structure(expected, current_path))
        return result

    def print_report(self):
        print("\n" + "="*50)
        print(f"{Fore.GREEN}项目结构检查报告{Style.RESET_ALL}")
        print("="*50)
        
        if self.issues:
            print(f"\n{Fore.RED}发现的问题:{Style.RESET_ALL}")
            for issue in self.issues:
                print(f"❌ {issue}")
        
        if self.warnings:
            print(f"\n{Fore.YELLOW}警告:{Style.RESET_ALL}")
            for warning in self.warnings:
                print(f"⚠️ {warning}")
                
        if not self.issues and not self.warnings:
            print(f"\n{Fore.GREEN}✅ 没有发现问题！项目结构符合要求。{Style.RESET_ALL}")
        
        print("\n" + "="*50)

def check_three_level_structure(root_dir: str) -> Dict:
    structure = {}
    
    for root, dirs, files in os.walk(root_dir):
        # 计算当前目录的深度
        depth = root[len(root_dir):].count(os.sep)
        if depth <= 2:  # 只检查三级目录
            rel_path = os.path.relpath(root, root_dir)
            if rel_path == '.':
                continue
                
            path_parts = rel_path.split(os.sep)
            current_dict = structure
            
            # 构建目录树
            for part in path_parts:
                if part not in current_dict:
                    current_dict[part] = {'__files': []}
                current_dict = current_dict[part]
            
            # 添加文件
            if depth <= 2:
                current_dict['__files'].extend(files)
    
    return structure

def print_structure(structure: Dict, indent: int = 0):
    for key, value in sorted(structure.items()):
        if key == '__files':
            for file in sorted(value):
                print(f"{' ' * indent}{Fore.GREEN}├── {file}{Style.RESET_ALL}")
        else:
            print(f"{' ' * indent}{Fore.BLUE}├── {key}/{Style.RESET_ALL}")
            print_structure(value, indent + 4)

def main():
    import argparse

    parser = argparse.ArgumentParser(description="检查项目结构的工具")
    parser.add_argument('--skip-import-check', action='store_true', help='跳过Python导入检查')
    parser.add_argument('--skip-yaml-check', action='store_true', help='跳过YAML文件检查')
    args = parser.parse_args()

    checker = ProjectStructureChecker()
    structure_valid = checker.check_structure()
    imports_valid = True if args.skip_import_check else checker.check_python_imports()
    yaml_valid = True if args.skip_yaml_check else checker.check_yaml_files()
    requirements_valid = checker.check_requirements()

    checker.print_report()
    if not all([structure_valid, imports_valid, yaml_valid, requirements_valid]):
        sys.exit(1)

    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    structure = check_three_level_structure(root_dir)
    
    print(f"\n{Fore.YELLOW}项目三级目录结构：{Style.RESET_ALL}")
    print_structure(structure)
    
    # 检查必要的目录和文件
    required_dirs = {
        'backend': {
            'api': ['__init__.py', 'auth.py', 'strategies.py', 'trades.py'],
            'models': ['__init__.py', 'database.py'],
            'services': ['__init__.py', 'market_data_service.py', 'execution_engine.py'],
            'strategy': ['__init__.py', 'backtest_template.py']
        },
        'config': ['base.yml', 'development.yml', 'production.yml'],
        'deploy': ['docker-compose.yml', 'Dockerfile.backend'],
        'docs': ['DEPLOYMENT.md', 'DEVELOPMENT.md'],
        'scripts': ['create_admin.py', 'backup_db.sh'],
        'tests': ['__init__.py', 'test_strategies.py']
    }
    
    print(f"\n{Fore.YELLOW}缺失文件检查：{Style.RESET_ALL}")
    for dir_name, contents in required_dirs.items():
        if dir_name not in structure:
            print(f"{Fore.RED}缺少目录: {dir_name}/{Style.RESET_ALL}")
            continue
            
        if isinstance(contents, list):
            for file in contents:
                if file not in structure[dir_name]['__files']:
                    print(f"{Fore.RED}缺少文件: {dir_name}/{file}{Style.RESET_ALL}")
        else:
            for subdir, files in contents.items():
                if subdir not in structure[dir_name]:
                    print(f"{Fore.RED}缺少子目录: {dir_name}/{subdir}/{Style.RESET_ALL}")
                    continue
                    
                for file in files:
                    if file not in structure[dir_name][subdir]['__files']:
                        print(f"{Fore.RED}缺少文件: {dir_name}/{subdir}/{file}{Style.RESET_ALL}")

if __name__ == "__main__":
    main()

