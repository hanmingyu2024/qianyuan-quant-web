import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from typing import List, Dict
import jinja2
import pdfkit
import io
import base64

class ReportService:
    def __init__(self):
        self.template_loader = jinja2.FileSystemLoader('templates')
        self.template_env = jinja2.Environment(loader=self.template_loader)

    def generate_trading_report(
        self,
        trades: List[Dict],
        performance_metrics: Dict,
        equity_curve: List[float],
        start_date: datetime,
        end_date: datetime
    ) -> bytes:
        """生成交易报告"""
        # 生成图表
        figures = self._generate_report_figures(trades, equity_curve)
        
        # 准备报告数据
        report_data = {
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'total_trades': len(trades),
            'performance_metrics': performance_metrics,
            'figures': figures,
            'recent_trades': trades[-10:],  # 最近10笔交易
        }
        
        # 渲染HTML模板
        template = self.template_env.get_template('trading_report.html')
        html_content = template.render(**report_data)
        
        # 转换为PDF
        pdf_options = {
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
        }
        pdf_content = pdfkit.from_string(html_content, False, options=pdf_options)
        
        return pdf_content

    def _generate_report_figures(self, trades: List[Dict], equity_curve: List[float]) -> Dict:
        """生成报告图表"""
        figures = {}
        
        # 权益曲线图
        plt.figure(figsize=(10, 6))
        plt.plot(equity_curve)
        plt.title('Equity Curve')
        plt.xlabel('Time')
        plt.ylabel('Equity')
        plt.grid(True)
        
        # 将图表转换为base64字符串
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png')
        plt.close()
        buffer.seek(0)
        figures['equity_curve'] = base64.b64encode(buffer.getvalue()).decode()
        
        # 交易分布图
        trades_df = pd.DataFrame(trades)
        plt.figure(figsize=(10, 6))
        trades_df['pnl'].hist(bins=50)
        plt.title('Trade PnL Distribution')
        plt.xlabel('PnL')
        plt.ylabel('Frequency')
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png')
        plt.close()
        buffer.seek(0)
        figures['pnl_distribution'] = base64.b64encode(buffer.getvalue()).decode()
        
        return figures

    def generate_risk_report(
        self,
        positions: List[Dict],
        risk_metrics: Dict,
        var_history: List[float]
    ) -> bytes:
        """生成风险报告"""
        # 准备风险报告数据
        report_data = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'positions': positions,
            'risk_metrics': risk_metrics,
            'var_history': var_history
        }
        
        # 渲染HTML模板
        template = self.template_env.get_template('risk_report.html')
        html_content = template.render(**report_data)
        
        # 转换为PDF
        pdf_options = {
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
        }
        pdf_content = pdfkit.from_string(html_content, False, options=pdf_options)
        
        return pdf_content

    def generate_performance_summary(
        self,
        performance_data: Dict,
        timeframe: str = 'daily'
    ) -> bytes:
        """生成性能总结报告"""
        # 准备性能数据
        summary_data = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'timeframe': timeframe,
            'performance_data': performance_data
        }
        
        # 渲染HTML模板
        template = self.template_env.get_template('performance_summary.html')
        html_content = template.render(**summary_data)
        
        # 转换为PDF
        pdf_options = {
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
        }
        pdf_content = pdfkit.from_string(html_content, False, options=pdf_options)
        
        return pdf_content 