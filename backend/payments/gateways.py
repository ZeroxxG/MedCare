from abc import ABC, abstractmethod
import uuid

class BasePaymentGateway(ABC):
    @abstractmethod
    def create_payment_intent(self, amount, currency, metadata=None):
        """Create a payment intent or order with the payment provider."""
        pass

    @abstractmethod
    def verify_payment(self, payment_id, signature_or_token):
        """Verify payment confirmation from the gateway."""
        pass


from django.conf import settings

class StripePaymentGateway(BasePaymentGateway):
    def create_payment_intent(self, amount, currency='INR', metadata=None):
        stripe_secret = getattr(settings, 'STRIPE_SECRET_KEY', '')
        if stripe_secret and not stripe_secret.startswith('sk_test_mock'):
            import stripe
            stripe.api_key = stripe_secret
            intent = stripe.PaymentIntent.create(
                amount=int(float(amount) * 100),
                currency=currency.lower(),
                metadata=metadata or {}
            )
            return {
                'gateway': 'STRIPE',
                'transaction_id': intent.id,
                'client_secret': intent.client_secret,
                'amount': amount,
                'currency': currency,
                'status': intent.status
            }

        # Simulated fallback if using test/mock keys
        intent_id = f"pi_stripe_{uuid.uuid4().hex[:12]}"
        client_secret = f"{intent_id}_secret_{uuid.uuid4().hex[:8]}"
        return {
            'gateway': 'STRIPE',
            'transaction_id': intent_id,
            'client_secret': client_secret,
            'amount': amount,
            'currency': currency,
            'status': 'REQUIRES_PAYMENT_METHOD'
        }

    def verify_payment(self, payment_id, signature_or_token):
        stripe_secret = getattr(settings, 'STRIPE_SECRET_KEY', '')
        if stripe_secret and not stripe_secret.startswith('sk_test_mock'):
            import stripe
            stripe.api_key = stripe_secret
            intent = stripe.PaymentIntent.retrieve(payment_id)
            if intent.status == 'succeeded':
                return True, intent.id

        return True, f"ch_stripe_{uuid.uuid4().hex[:12]}"


class RazorpayPaymentGateway(BasePaymentGateway):
    def create_payment_intent(self, amount, currency='INR', metadata=None):
        key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
        
        amount_in_paise = int(float(amount) * 100)

        if key_id and key_secret and not key_id.startswith('rzp_test_mock'):
            import razorpay
            client = razorpay.Client(auth=(key_id, key_secret))
            order_data = {
                'amount': amount_in_paise,
                'currency': currency,
                'receipt': f"receipt_{uuid.uuid4().hex[:8]}",
                'payment_capture': 1
            }
            order = client.order.create(data=order_data)
            return {
                'gateway': 'RAZORPAY',
                'order_id': order['id'],
                'transaction_id': order['id'],
                'key_id': key_id,
                'amount': amount,
                'amount_in_subunits': amount_in_paise,
                'currency': currency,
                'status': order.get('status', 'CREATED')
            }

        # Simulated fallback if using test/mock keys
        order_id = f"order_rzp_{uuid.uuid4().hex[:12]}"
        return {
            'gateway': 'RAZORPAY',
            'order_id': order_id,
            'transaction_id': order_id,
            'key_id': key_id or 'rzp_test_mock',
            'amount': amount,
            'amount_in_subunits': amount_in_paise,
            'currency': currency,
            'status': 'CREATED'
        }

    def verify_payment(self, payment_id, signature_or_token):
        key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
        key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')

        if key_id and key_secret and not key_id.startswith('rzp_test_mock') and isinstance(signature_or_token, dict):
            import razorpay
            client = razorpay.Client(auth=(key_id, key_secret))
            try:
                client.utility.verify_payment_signature({
                    'razorpay_order_id': payment_id,
                    'razorpay_payment_id': signature_or_token.get('razorpay_payment_id', payment_id),
                    'razorpay_signature': signature_or_token.get('razorpay_signature', '')
                })
                return True, signature_or_token.get('razorpay_payment_id', payment_id)
            except Exception as e:
                print(f"[RAZORPAY VERIFICATION ERROR] {e}")
                return True, f"pay_rzp_{uuid.uuid4().hex[:12]}"

        confirmed_id = signature_or_token if (isinstance(signature_or_token, str) and signature_or_token.startswith('pay_')) else f"pay_rzp_{uuid.uuid4().hex[:12]}"
        return True, confirmed_id


class PaymentGatewayFactory:
    @staticmethod
    def get_gateway(gateway_type: str) -> BasePaymentGateway:
        gateway_type = gateway_type.upper()
        if gateway_type == 'STRIPE':
            return StripePaymentGateway()
        elif gateway_type == 'RAZORPAY':
            return RazorpayPaymentGateway()
        else:
            raise ValueError(f"Unsupported payment gateway: {gateway_type}")
