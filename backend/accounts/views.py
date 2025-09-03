# accounts/views.py
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.core.mail import send_mail
from django.shortcuts import redirect

from django.contrib.auth.models import AbstractBaseUser

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    RegisterSerializer, UserSerializer, ChangePasswordSerializer,
    EmailTokenObtainPairSerializer, ForgotPasswordSerializer,
    PasswordResetConfirmSerializer, ResendVerificationSerializer,
)

User = get_user_model()


def send_password_reset_email(user: AbstractBaseUser) -> None:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
    subject = "Set your password"
    message = (
        f"Hi {getattr(user, 'username', '') or user.get_username()},\n\n"
        f"Click the link below to set your password:\n{reset_link}\n\n"
        f"If you did not request this, you can ignore this email."
    )
    # 🔎 Debug prints
    print("[send_password_reset_email] to:", user.email)
    print("[send_password_reset_email] uid:", user.pk, "uidb64:", uid)
    print("[send_password_reset_email] token (prefix):", token[:12], "...")

    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        # This flow expects user to set password via email link
        # Optionally, you can make them inactive until first set
        # user.is_active = False
        # user.save(update_fields=["is_active"])

        # 🔎 Debug prints
        print("[Register] created user id:", user.pk, "email:", user.email, "is_active:", user.is_active)

        if user.email:
            send_password_reset_email(user)


class EmailTokenObtainPairView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # 🔎 Debug prints
        payload_preview = {**request.data}
        if "password" in payload_preview:
            payload_preview["password"] = "***redacted***"
        print("[Login] incoming payload:", payload_preview)

        ser = EmailTokenObtainPairSerializer(data=request.data)
        if not ser.is_valid():
            print("[Login] serializer errors:", ser.errors)
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        print("[Login] success for:", ser.validated_data.get("email") or request.data.get("email"))
        return Response(ser.validated_data)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    def get_object(self):
        return self.request.user


class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print("[ResendVerification] incoming:", request.data)

        ser = ResendVerificationSerializer(data=request.data)
        if not ser.is_valid():
            print("[ResendVerification] serializer errors:", ser.errors)
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        email = ser.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()
        print("[ResendVerification] found user:", bool(user), "is_active:", getattr(user, "is_active", None))

        if user and not user.is_active:
            send_password_reset_email(user)
        return Response({"detail": "If the account exists, a verification email was sent."})


class RequestPasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print("[ForgotPassword] incoming:", request.data)

        ser = ForgotPasswordSerializer(data=request.data)
        if not ser.is_valid():
            print("[ForgotPassword] serializer errors:", ser.errors)
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        email = ser.validated_data["email"]
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        print("[ForgotPassword] user exists & active:", bool(user))

        if user:
            send_password_reset_email(user)
        return Response({"detail": "If the email exists, a reset link was sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # 🔎 Debug: don’t print the password
        incoming_preview = {k: ("***redacted***" if k == "new_password" else v) for k, v in request.data.items()}
        print("[ResetPasswordConfirm] incoming:", incoming_preview)

        ser = PasswordResetConfirmSerializer(data=request.data)
        if not ser.is_valid():
            print("[ResetPasswordConfirm] serializer errors:", ser.errors)
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        uidb64 = ser.validated_data["uidb64"]
        token = ser.validated_data["token"]
        new_password = ser.validated_data["new_password"]

        print("[ResetPasswordConfirm] uidb64:", uidb64, "token(prefix):", token[:12], "...")

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            print("[ResetPasswordConfirm] decoded uid:", uid, "user found:", True)
        except Exception as ex:
            print("[ResetPasswordConfirm] decode/get user failed:", repr(ex))
            user = None

        if user is None:
            print("[ResetPasswordConfirm] no user for uidb64:", uidb64)
            return Response({"detail": "Invalid or expired link."}, status=status.HTTP_400_BAD_REQUEST)

        is_valid_token = default_token_generator.check_token(user, token)
        print("[ResetPasswordConfirm] token valid?", is_valid_token)

        if not is_valid_token:
            return Response({"detail": "Invalid or expired link."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        # If you want first set to activate the account:
        if not user.is_active:
            user.is_active = True
            print("[ResetPasswordConfirm] activating user:", user.pk)

        user.save()
        print("[ResetPasswordConfirm] password updated for user:", user.pk)

        return Response({"detail": "Password has been set."})
