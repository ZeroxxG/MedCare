import os
import socket
import smtplib
import ssl
import json
import urllib.request
from django.core.mail.backends.smtp import EmailBackend as DjangoEmailBackend


def send_via_resend_api(api_key, subject, message, from_email, recipient_list):
    """
    Sends email via Resend HTTP API over Port 443 HTTPS.
    Bypasses cloud server SMTP firewall blocks on ports 25, 465, and 587.
    """
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json"
    }
    # On Resend free tier without verified domain, 'from' must be 'onboarding@resend.dev' or 'Name <onboarding@resend.dev>'
    sender = os.environ.get('RESEND_FROM_EMAIL', 'MediConnect <onboarding@resend.dev>').strip()
    payload = {
        "from": sender,
        "to": recipient_list if isinstance(recipient_list, list) else [recipient_list],
        "subject": subject,
        "text": message
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"[RESEND HTTP API SUCCESS] Email delivered over Port 443 HTTPS (Status {resp.status})")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')
        print(f"[RESEND HTTP API ERROR] HTTP {e.code}: {body}")
        return False
    except Exception as e:
        print(f"[RESEND HTTP API ERROR] {e}")
        return False


def send_via_brevo_api(api_key, subject, message, from_email, recipient_list):
    """
    Sends email via Brevo (Sendinblue) HTTP API over Port 443 HTTPS.
    Bypasses cloud server SMTP firewall blocks on ports 25, 465, and 587.
    """
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": api_key.strip(),
        "Content-Type": "application/json"
    }
    recipients = [{"email": email} for email in (recipient_list if isinstance(recipient_list, list) else [recipient_list])]
    sender_email = os.environ.get('EMAIL_HOST_USER', 'mdhamd90@gmail.com').strip()
    payload = {
        "sender": {"name": "MediConnect Healthcare", "email": sender_email},
        "to": recipients,
        "subject": subject,
        "textContent": message
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"[BREVO HTTP API SUCCESS] Email delivered over Port 443 HTTPS (Status {resp.status})")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')
        print(f"[BREVO HTTP API ERROR] HTTP {e.code}: {body}")
        return False
    except Exception as e:
        print(f"[BREVO HTTP API ERROR] {e}")
        return False


class IPv4EmailBackend(DjangoEmailBackend):
    """
    Custom SMTP Email Backend that:
    1. Forces IPv4 DNS resolution (socket.AF_INET) to prevent 'OSError: [Errno 101] Network is unreachable' on IPv6-less cloud hosts (Render/Docker).
    2. Automatically falls back from Port 587 to Port 465 (SSL) if Port 587 is blocked/times out on cloud firewalls.
    3. Supports Resend / Brevo HTTP APIs over Port 443 HTTPS if SMTP ports (25/465/587) are completely blocked by host firewall.
    """
    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        # Check if HTTP API keys are set in environment
        resend_key = os.environ.get('RESEND_API_KEY', '').strip()
        brevo_key = os.environ.get('BREVO_API_KEY', '').strip()

        if resend_key:
            sent_count = 0
            for message in email_messages:
                if send_via_resend_api(resend_key, message.subject, message.body, message.from_email, message.to):
                    sent_count += 1
            return sent_count

        if brevo_key:
            sent_count = 0
            for message in email_messages:
                if send_via_brevo_api(brevo_key, message.subject, message.body, message.from_email, message.to):
                    sent_count += 1
            return sent_count

        # Standard SMTP with IPv4 & SSL fallback
        try:
            return super().send_messages(email_messages)
        except Exception as e:
            print(f"[SMTP BACKEND ERROR] All SMTP ports (587 & 465) failed/timed out: {e}")
            print("[SMTP TIP] Render blocks raw SMTP ports on free tier. Add RESEND_API_KEY or BREVO_API_KEY in Render Environment Variables to send emails via Port 443 HTTPS API!")
            return 0

    def open(self):
        if self.connection:
            return False

        orig_getaddrinfo = socket.getaddrinfo

        def ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
            return orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

        try:
            socket.getaddrinfo = ipv4_getaddrinfo
            res = super().open()
            return res
        except Exception as primary_err:
            if self.port != 465:
                print(f"[SMTP BACKEND] Primary connection on port {self.port} failed ({primary_err}). Retrying via Port 465 SSL...")
                try:
                    context = ssl.create_default_context()
                    self.connection = smtplib.SMTP_SSL(
                        self.host,
                        465,
                        context=context,
                        timeout=self.timeout or 10
                    )
                    if self.username and self.password:
                        self.connection.login(self.username, self.password)
                    print("[SMTP BACKEND] Port 465 SSL Fallback Connection Successful!")
                    return True
                except Exception as fallback_err:
                    print(f"[SMTP BACKEND ERROR] Port 465 SSL Fallback failed: {fallback_err}")
                    return False
            return False
        finally:
            socket.getaddrinfo = orig_getaddrinfo
