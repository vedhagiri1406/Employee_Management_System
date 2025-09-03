# config/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/forms/", include("formsapp.urls")),
    path("api/employees/", include("employees.urls")),
]
