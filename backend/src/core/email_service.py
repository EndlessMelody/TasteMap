"""
Email service for sending OTP and other emails.
For development: logs to console when SMTP is not configured.
For production: configure SMTP_HOST/USER/PASSWORD env vars.
"""
import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from src.core.config import settings


class EmailService:
    """Service for sending emails."""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.FROM_EMAIL
        self.from_name = settings.FROM_NAME
    
    async def send_otp_email(self, to_email: str, otp: str, username: str = "") -> bool:
        """
        Send OTP verification email.
        Returns True if sent successfully.
        """
        subject = "Your TasteMap Verification Code"
        
        # HTML email template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TasteMap Verification</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 20px;
                }}
                .container {{
                    max-width: 500px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }}
                .logo {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .logo-text {{
                    font-size: 24px;
                    font-weight: 800;
                    color: #1C1C1E;
                }}
                .logo-dot {{
                    color: #4F8EF7;
                }}
                h1 {{
                    font-size: 22px;
                    font-weight: 700;
                    color: #1C1C1E;
                    margin: 0 0 16px 0;
                    text-align: center;
                }}
                p {{
                    font-size: 15px;
                    color: rgba(0,0,0,0.6);
                    line-height: 1.6;
                    margin: 0 0 24px 0;
                    text-align: center;
                }}
                .otp-box {{
                    background: linear-gradient(135deg, #1A7AFF, #0057D9);
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    margin: 24px 0;
                }}
                .otp-code {{
                    font-size: 36px;
                    font-weight: 800;
                    letter-spacing: 8px;
                    color: white;
                    margin: 0;
                }}
                .otp-label {{
                    font-size: 12px;
                    color: rgba(255,255,255,0.7);
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }}
                .expiry {{
                    font-size: 13px;
                    color: rgba(0,0,0,0.45);
                    text-align: center;
                    margin-top: 20px;
                }}
                .footer {{
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(0,0,0,0.08);
                    font-size: 12px;
                    color: rgba(0,0,0,0.4);
                    text-align: center;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <span class="logo-text">TasteMap<span class="logo-dot">.</span></span>
                </div>
                <h1>Verify Your Email</h1>
                <p>Hi {username or 'there'},<br>Use the code below to complete your registration on TasteMap.</p>
                
                <div class="otp-box">
                    <div class="otp-label">Verification Code</div>
                    <div class="otp-code">{otp}</div>
                </div>
                
                <p class="expiry">This code expires in 10 minutes.<br>If you didn't request this, you can safely ignore this email.</p>
                
                <div class="footer">
                    &copy; 2025 TasteMap. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
TasteMap Verification Code

Hi {username or 'there'},

Your verification code is: {otp}

This code expires in 10 minutes.
If you didn't request this, you can safely ignore this email.

TasteMap Team
"""
        
        if self.smtp_host and self.smtp_user:
            await asyncio.to_thread(
                self._send_smtp_sync, to_email, subject, text_content, html_content
            )
        else:
            print(f"\n{'='*50}")
            print(f"[DEV] EMAIL TO: {to_email}")
            print(f"[DEV] SUBJECT: {subject}")
            print(f"[DEV] OTP: {otp}")
            print(f"{'='*50}\n")
        
        return True
    
    def _send_smtp_sync(self, to_email: str, subject: str, text: str, html: str) -> None:
        """Send email via SMTP (blocking — called via asyncio.to_thread)."""
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{self.from_name} <{self.from_email}>"
        msg["To"] = to_email
        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.sendmail(self.from_email, to_email, msg.as_string())


# Global instance
email_service = EmailService()
