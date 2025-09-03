from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FormTemplateViewSet

router = DefaultRouter()
router.register("", FormTemplateViewSet, basename="formtemplate")
urlpatterns = [path("", include(router.urls))]
