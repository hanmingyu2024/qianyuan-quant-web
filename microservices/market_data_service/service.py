import requests

def get_market_data(symbol):
    # 假设从某个API获取市场数据
    response = requests.get(f'http://marketdataapi.com/{symbol}')
    return response.json()
