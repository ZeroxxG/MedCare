import socket
from django.core.mail.backends.smtp import EmailBackend as DjangoEmailBackend

class IPv4EmailBackend(DjangoEmailBackend):
    """
    Custom SMTP Email Backend that forces IPv4 DNS resolution (socket.AF_INET).
    Prevents 'OSError: [Errno 101] Network is unreachable' on cloud hosts like Render
    which do not have outbound IPv6 routing enabled.
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
        finally:
            socket.getaddrinfo = orig_getaddrinfo
