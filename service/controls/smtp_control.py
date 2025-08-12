import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

 
# Initialize the logger
logger = logging.getLogger(__name__)

class SmtpControl:
    def __init__(self):
        # Configure the logger
        logging.basicConfig(level=logging.INFO)
        logger.info("SMTP Control initialized.")
        self.app_password = "yhaylsjsqoglymsk"

    def send_email(self, sender_email: str, receiver_email: str, subject: str, body: str) -> bool:
        """Send an email using Gmail SMTP."""
        try:
            # Compose the email
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = receiver_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            # Connect to the SMTP server and send the email
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(sender_email, self.app_password)
                server.sendmail(sender_email, receiver_email, msg.as_string())
                logger.info("Email sent successfully.")
                return True
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False