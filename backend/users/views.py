import uuid
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.mail import send_mail

from .models import EmailVerificationToken, PasswordResetToken
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    GoogleAuthSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer
)

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Create profiles based on role
            if user.role == User.Role.DOCTOR:
                from doctors.models import DoctorProfile, Specialization
                doc_profile = DoctorProfile.objects.create(
                    user=user,
                    medical_registration_number=request.data.get('medical_registration_number'),
                    experience_years=request.data.get('experience_years') or 0,
                    gender=user.gender
                )
                spec_id = request.data.get('specialization_id')
                if spec_id:
                    from django.db.models import Q
                    try:
                        spec = Specialization.objects.filter(Q(id=spec_id) | Q(name__iexact=str(spec_id))).first()
                        if not spec:
                            spec, _ = Specialization.objects.get_or_create(name=str(spec_id).title())
                        doc_profile.specialization = spec
                        doc_profile.save()
                    except Exception as e:
                        print(f"[REGISTER SPEC ERROR] {e}")
            elif user.role == User.Role.PATIENT:
                from patients.models import PatientProfile
                PatientProfile.objects.create(user=user)

            # Generate Email Verification Token
            token_obj = EmailVerificationToken.objects.create(user=user)
            
            # Send Email Verification
            send_mail(
                subject='Verify your MediConnect Account',
                message=f'Welcome to MediConnect! Use this token to verify your email: {token_obj.token}',
                from_email='noreply@mediconnect.com',
                recipient_list=[user.email],
                fail_silently=True
            )

            # Issue JWT Token automatically on register
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Registration successful. Verification email sent.',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


import base64
import json

def parse_google_jwt(id_token):
    """Safely decode Google ID token JWT payload."""
    try:
        parts = id_token.split('.')
        if len(parts) == 3:
            payload_b64 = parts[1]
            payload_b64 += '=' * (-len(payload_b64) % 4)
            decoded_bytes = base64.b64decode(payload_b64)
            return json.loads(decoded_bytes.decode('utf-8'))
    except Exception as e:
        print(f"[JWT PARSE ERROR] {e}")
    return {}

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            serializer = GoogleAuthSerializer(data=request.data)
            if serializer.is_valid():
                id_token = serializer.validated_data['id_token']
                role = serializer.validated_data['role']
                
                google_email = None
                google_first_name = request.data.get('first_name')
                google_last_name = request.data.get('last_name')
                google_id = str(id_token)[:255]

                # 1. Try verification via Google TokenInfo endpoint
                if id_token and "." in id_token and not id_token.startswith("google_mock"):
                    import requests
                    try:
                        resp = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}", timeout=5)
                        if resp.status_code == 200:
                            gdata = resp.json()
                            google_email = gdata.get('email')
                            google_first_name = gdata.get('given_name', google_first_name)
                            google_last_name = gdata.get('family_name', google_last_name)
                            google_id = gdata.get('sub', google_id)
                        else:
                            print(f"[GOOGLE TOKENINFO WARN] Google returned status {resp.status_code}: {resp.text}")
                    except Exception as e:
                        print(f"[GOOGLE TOKENINFO ERROR] {e}")

                    # 2. Fallback: Parse Google JWT token payload directly
                    if not google_email:
                        jwt_data = parse_google_jwt(id_token)
                        google_email = jwt_data.get('email')
                        google_first_name = jwt_data.get('given_name') or google_first_name or 'Google'
                        google_last_name = jwt_data.get('family_name') or google_last_name or 'User'
                        google_id = jwt_data.get('sub') or google_id

                if not google_email:
                    return Response(
                        {'detail': 'Google authentication failed. Could not retrieve your Google account email. Please ensure your Google account has a verified email address.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if not google_first_name:
                    google_first_name = 'Google'
                if not google_last_name:
                    google_last_name = 'User'

                # 3. Find or Create User
                user = User.objects.filter(email=google_email).first()
                if not user:
                    user = User.objects.create_user(
                        email=google_email,
                        first_name=google_first_name,
                        last_name=google_last_name,
                        role=role,
                        is_email_verified=True,
                        google_id=google_id
                    )

                # Ensure google_id & email verification linked
                if not user.google_id:
                    user.google_id = google_id
                    user.is_email_verified = True
                    user.save()

                # Ensure Profile exists for Doctor or Patient
                if user.role == User.Role.DOCTOR:
                    from doctors.models import DoctorProfile
                    DoctorProfile.objects.get_or_create(user=user)
                else:
                    from patients.models import PatientProfile
                    PatientProfile.objects.get_or_create(user=user)

                refresh = RefreshToken.for_user(user)

                return Response({
                    'message': 'Google Login successful',
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            import traceback
            traceback.print_exc()
            return Response({'error': f'Google OAuth verification error: {str(err)}'}, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token_obj = EmailVerificationToken.objects.get(token=token, is_used=False)
            token_obj.user.is_email_verified = True
            token_obj.user.save()
            token_obj.is_used = True
            token_obj.save()
            return Response({'message': 'Email verified successfully!'}, status=status.HTTP_200_OK)
        except EmailVerificationToken.DoesNotExist:
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            reset_token = None
            try:
                user = User.objects.get(email=email)
                token_obj = PasswordResetToken.objects.create(user=user)
                reset_token = str(token_obj.token)
                reset_link = f"http://localhost:5173/forgot-password?token={reset_token}"

                email_subject = 'Reset Your MediConnect Password'
                email_body = f"""Dear User,

You requested a password reset for your MediConnect account.

Please click the link below to reset your password:
{reset_link}

This link will expire in 24 hours. If you did not request a password reset, please ignore this email.

Thank you,
The MediConnect Team
"""

                print(f"[EMAIL SERVICE] Sending password reset link '{reset_link}' to {user.email}")
                send_mail(
                    subject=email_subject,
                    message=email_body,
                    from_email='MediConnect Healthcare <noreply@mediconnect.com>',
                    recipient_list=[user.email],
                    fail_silently=True
                )

                try:
                    from notifications.models import Notification
                    Notification.objects.create(
                        user=user,
                        title=email_subject,
                        message=email_body
                    )
                except Exception:
                    pass

            except User.DoesNotExist:
                pass # Silent for security

            return Response({
                'message': 'Password reset link has been dispatched to your email.'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            try:
                token_obj = PasswordResetToken.objects.get(token=token, is_used=False)
                user = token_obj.user
                user.set_password(new_password)
                user.save()
                token_obj.is_used = True
                token_obj.save()
                return Response({'message': 'Password reset successfully!'}, status=status.HTTP_200_OK)
            except PasswordResetToken.DoesNotExist:
                return Response({'error': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'old_password': 'Wrong password.'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
