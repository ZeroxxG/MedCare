import socket
import smtplib
import ssl
from django.core.mail.backends.smtp import EmailBackend as DjangoEmailBackend

class IPv4EmailBackend(DjangoEmailBackend):
    """
    Custom SMTP Email Backend that:
    1. Forces IPv4 DNS resolution (socket.AF_INET) to prevent 'OSError: [Errno 101] Network is unreachable' on IPv6-less cloud hosts (Render/Docker).
    2. Automatically falls back from Port 587 to Port 465 (SSL) if Port 587 is blocked/times out on cloud firewalls.
    """
    def open(self):
        if self.connection:
            return False

        orig_getaddrinfo = socket.getaddrinfo

        def ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
            return orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

        try:
            socket.getaddrinfo = ipv4_getaddrinfo
            return super().open()
        except (TimeoutError, socket.timeout, OSError) as primary_err:
            # If port 587 timed out or failed, attempt Port 465 SSL fallback
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
                    raise primary_err
            raise primary_err
        finally:
            socket.getaddrinfo = orig_getaddrinfo
