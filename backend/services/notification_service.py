import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import logging
from typing import List, Dict
from datetime import datetime

class NotificationService:
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # 邮件配置
        self.smtp_server = config.get('smtp_server')
        self.smtp_port = config.get('smtp_port')
        self.smtp_username = config.get('smtp_username')
        self.smtp_password = config.get('smtp_password')
        
        # 钉钉配置
        self.dingtalk_webhook = config.get('dingtalk_webhook')
        
        # 微信配置
        self.wechat_webhook = config.get('wechat_webhook')

    def send_email(
        self,
        to_addresses: List[str],
        subject: str,
        content: str,
        attachments: List[Dict] = None
    ) -> bool:
        """发送邮件通知"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_username
            msg['To'] = ', '.join(to_addresses)
            msg['Subject'] = subject
            
            msg.attach(MIMEText(content, 'html'))
            
            # 添加附件
            if attachments:
                for attachment in attachments:
                    part = MIMEText(attachment['content'], 'base64', 'utf-8')
                    part['Content-Type'] = 'application/octet-stream'
                    part['Content-Disposition'] = f'attachment; filename="{attachment["filename"]}"'
                    msg.attach(part)
            
            # 发送邮件
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            return True

        except Exception as e:
            self.logger.error(f"Error sending email: {str(e)}")
            return False

    def send_dingtalk(self, message: str, at_mobiles: List[str] = None) -> bool:
        """发送钉钉通知"""
        try:
            headers = {'Content-Type': 'application/json'}
            data = {
                "msgtype": "text",
                "text": {
                    "content": message
                },
                "at": {
                    "atMobiles": at_mobiles or [],
                    "isAtAll": False
                }
            }
            
            response = requests.post(self.dingtalk_webhook, json=data, headers=headers)
            return response.status_code == 200

        except Exception as e:
            self.logger.error(f"Error sending DingTalk notification: {str(e)}")
            return False

    def send_wechat(self, message: str) -> bool:
        """发送微信通知"""
        try:
            headers = {'Content-Type': 'application/json'}
            data = {
                "msgtype": "text",
                "text": {
                    "content": message
                }
            }
            
            response = requests.post(self.wechat_webhook, json=data, headers=headers)
            return response.status_code == 200

        except Exception as e:
            self.logger.error(f"Error sending WeChat notification: {str(e)}")
            return False

    def send_alert(
        self,
        alert_type: str,
        message: str,
        severity: str = 'info',
        channels: List[str] = None
    ) -> bool:
        """发送警报通知"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        formatted_message = f"[{severity.upper()}] {timestamp}\n{alert_type}: {message}"
        
        success = True
        channels = channels or ['email']
        
        if 'email' in channels:
            success &= self.send_email(
                self.config.get('alert_emails', []),
                f"Trading Alert: {alert_type}",
                formatted_message
            )
            
        if 'dingtalk' in channels:
            success &= self.send_dingtalk(formatted_message)
            
        if 'wechat' in channels:
            success &= self.send_wechat(formatted_message)
            
        return success 