from flask import Flask
from flask_cors import CORS
from api import api_blueprint
from auth import auth_blueprint
from config import Config

app = Flask(__name__)
CORS(app)

# 加载配置
app.config.from_object(Config)

# 注册蓝图
app.register_blueprint(api_blueprint, url_prefix='/api')
app.register_blueprint(auth_blueprint, url_prefix='/auth')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

