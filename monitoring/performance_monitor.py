import psutil
import time
from datetime import datetime
import logging
from prometheus_client import start_http_server, Gauge, Counter, Histogram
from typing import Dict, List

class PerformanceMonitor:
    def __init__(self, port: int = 8000):
        # Prometheus metrics
        self.cpu_usage = Gauge('system_cpu_usage', 'System CPU usage percentage')
        self.memory_usage = Gauge('system_memory_usage', 'System memory usage percentage')
        self.disk_usage = Gauge('system_disk_usage', 'System disk usage percentage')
        
        self.order_counter = Counter('trading_orders_total', 'Total number of trading orders')
        self.trade_volume = Counter('trading_volume_total', 'Total trading volume')
        
        self.order_latency = Histogram(
            'order_processing_seconds',
            'Time spent processing orders',
            buckets=[0.1, 0.5, 1.0, 2.0, 5.0]
        )
        
        self.strategy_execution_time = Histogram(
            'strategy_execution_seconds',
            'Time spent executing trading strategies',
            buckets=[0.1, 0.5, 1.0, 2.0, 5.0]
        )
        
        # Start Prometheus HTTP server
        start_http_server(port)
        self.logger = logging.getLogger(__name__)

    def monitor_system_metrics(self):
        """监控系统指标"""
        try:
            # CPU使用率
            cpu_percent = psutil.cpu_percent(interval=1)
            self.cpu_usage.set(cpu_percent)

            # 内存使用率
            memory = psutil.virtual_memory()
            self.memory_usage.set(memory.percent)

            # 磁盘使用率
            disk = psutil.disk_usage('/')
            self.disk_usage.set(disk.percent)

        except Exception as e:
            self.logger.error(f"Error monitoring system metrics: {str(e)}")

    def record_order(self, order_value: float):
        """记录订单"""
        self.order_counter.inc()
        self.trade_volume.inc(order_value)

    def measure_order_latency(self, func):
        """测量订单处理延迟的装饰器"""
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            self.order_latency.observe(duration)
            return result
        return wrapper

    def measure_strategy_execution(self, func):
        """测量策略执行时间的装饰器"""
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            self.strategy_execution_time.observe(duration)
            return result
        return wrapper

    def get_performance_metrics(self) -> Dict:
        """获取性能指标摘要"""
        return {
            'timestamp': datetime.now().isoformat(),
            'system': {
                'cpu_usage': psutil.cpu_percent(),
                'memory_usage': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent
            },
            'trading': {
                'total_orders': self.order_counter._value.get(),
                'total_volume': self.trade_volume._value.get()
            }
        }

    def alert_if_threshold_exceeded(self, metrics: Dict, thresholds: Dict):
        """检查并报警如果超过阈值"""
        alerts = []
        
        if metrics['system']['cpu_usage'] > thresholds.get('cpu', 80):
            alerts.append({
                'type': 'CPU_HIGH',
                'value': metrics['system']['cpu_usage'],
                'threshold': thresholds.get('cpu', 80)
            })
            
        if metrics['system']['memory_usage'] > thresholds.get('memory', 80):
            alerts.append({
                'type': 'MEMORY_HIGH',
                'value': metrics['system']['memory_usage'],
                'threshold': thresholds.get('memory', 80)
            })
            
        if metrics['system']['disk_usage'] > thresholds.get('disk', 80):
            alerts.append({
                'type': 'DISK_HIGH',
                'value': metrics['system']['disk_usage'],
                'threshold': thresholds.get('disk', 80)
            })
            
        return alerts 