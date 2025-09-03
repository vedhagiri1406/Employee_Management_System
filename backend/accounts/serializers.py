# accounts/serializers.py
from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]

# Register with username+email ONLY (no password here)
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email"]

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            is_active=False,  # activate after password is set
        )
        user.set_unusable_password()
        user.save()
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = self.context["request"].user
        if not user.check_password(data["old_password"]):
            raise serializers.ValidationError({"old_password": "Incorrect password"})
        password_validation.validate_password(data["new_password"], user)
        return data

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user

# Email+Password login that issues JWT
class EmailTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "Invalid email or password"})

        if not user.is_active:
            raise serializers.ValidationError({"detail": "Please verify your email and set your password."})

        if not user.check_password(password):
            raise serializers.ValidationError({"detail": "Invalid email or password"})

        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

# Forgot-password request
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

# Confirm reset (also used for initial set password)
class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

# Optional: resend verification (for initial set-password email)
class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
