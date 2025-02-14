from flask import Flask
import inspect
from typing import Dict, List
import yaml
import json
from pathlib import Path

class APIDocsGenerator:
    def __init__(self, app: Flask):
        self.app = app
        self.api_docs = {
            'openapi': '3.0.0',
            'info': {
                'title': '量化交易系统API文档',
                'version': '1.0.0',
                'description': '提供量化交易系统的所有API接口文档'
            },
            'paths': {},
            'components': {
                'schemas': {},
                'securitySchemes': {
                    'bearerAuth': {
                        'type': 'http',
                        'scheme': 'bearer',
                        'bearerFormat': 'JWT'
                    }
                }
            }
        }

    def generate_docs(self):
        """生成API文档"""
        for rule in self.app.url_map.iter_rules():
            if rule.endpoint != 'static':
                self._document_endpoint(rule)

    def _document_endpoint(self, rule):
        """记录端点信息"""
        view_func = self.app.view_functions[rule.endpoint]
        doc = inspect.getdoc(view_func)
        
        path = str(rule)
        method = list(rule.methods - {'OPTIONS', 'HEAD'})[0].lower()
        
        if path not in self.api_docs['paths']:
            self.api_docs['paths'][path] = {}
            
        operation = {
            'summary': doc.split('\n')[0] if doc else '',
            'description': doc if doc else '',
            'parameters': self._get_parameters(rule),
            'responses': self._get_responses(view_func),
            'tags': [rule.endpoint.split('.')[0]]
        }
        
        # 添加请求体信息
        if method in ['post', 'put']:
            operation['requestBody'] = self._get_request_body(view_func)
            
        # 添加安全要求
        if 'jwt_required' in str(view_func):
            operation['security'] = [{'bearerAuth': []}]
            
        self.api_docs['paths'][path][method] = operation

    def _get_parameters(self, rule) -> List[Dict]:
        """获取API参数信息"""
        parameters = []
        
        for arg in rule.arguments:
            param = {
                'name': arg,
                'in': 'path' if arg in str(rule) else 'query',
                'required': True if arg in str(rule) else False,
                'schema': {
                    'type': 'string'
                }
            }
            parameters.append(param)
            
        return parameters

    def _get_responses(self, view_func) -> Dict:
        """获取响应信息"""
        responses = {
            '200': {
                'description': 'Successful response',
                'content': {
                    'application/json': {
                        'schema': {
                            'type': 'object'
                        }
                    }
                }
            },
            '400': {
                'description': 'Bad request'
            },
            '401': {
                'description': 'Unauthorized'
            },
            '500': {
                'description': 'Internal server error'
            }
        }
        
        return responses

    def _get_request_body(self, view_func) -> Dict:
        """获取请求体信息"""
        # 尝试从函数注解中获取请求体模型
        annotations = inspect.getfullargspec(view_func).annotations
        
        if 'body' in annotations:
            model = annotations['body']
            schema = self._model_to_schema(model)
            
            return {
                'required': True,
                'content': {
                    'application/json': {
                        'schema': schema
                    }
                }
            }
            
        return {}

    def _model_to_schema(self, model) -> Dict:
        """将模型转换为JSON Schema"""
        schema = {
            'type': 'object',
            'properties': {}
        }
        
        for field_name, field in model.__annotations__.items():
            field_type = str(field).split("'")[1]
            
            if field_type == 'str':
                schema['properties'][field_name] = {'type': 'string'}
            elif field_type == 'int':
                schema['properties'][field_name] = {'type': 'integer'}
            elif field_type == 'float':
                schema['properties'][field_name] = {'type': 'number'}
            elif field_type == 'bool':
                schema['properties'][field_name] = {'type': 'boolean'}
                
        return schema

    def save_docs(self, format: str = 'yaml'):
        """保存API文档"""
        docs_dir = Path('docs')
        docs_dir.mkdir(exist_ok=True)
        
        if format == 'yaml':
            output_file = docs_dir / 'api_docs.yaml'
            with open(output_file, 'w', encoding='utf-8') as f:
                yaml.dump(self.api_docs, f, allow_unicode=True)
        else:
            output_file = docs_dir / 'api_docs.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.api_docs, f, ensure_ascii=False, indent=2) 