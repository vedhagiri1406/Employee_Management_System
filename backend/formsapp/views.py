# formsapp/views.py
from rest_framework import viewsets, permissions
from .models import FormTemplate
from .serializers import FormTemplateSerializer

class FormTemplateViewSet(viewsets.ModelViewSet):
    queryset = FormTemplate.objects.all()
    serializer_class = FormTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
