# accounts/urls.py
from django.urls import path
from .views import (
    RegisterView, EmailTokenObtainPairView, ProfileView, ChangePasswordView,
    RequestPasswordResetView, PasswordResetConfirmView, ResendVerificationView,
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login-email/", EmailTokenObtainPairView.as_view()),
    path("profile/", ProfileView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),

    path("forgot-password/", RequestPasswordResetView.as_view()),
    path("reset-password/", PasswordResetConfirmView.as_view()),
    path("resend-verification/", ResendVerificationView.as_view()),
]
