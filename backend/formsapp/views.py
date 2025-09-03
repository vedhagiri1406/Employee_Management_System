from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db.models.deletion import ProtectedError

from .models import FormTemplate
from .serializers import FormTemplateSerializer

class FormTemplateViewSet(viewsets.ModelViewSet):
    queryset = FormTemplate.objects.all()
    serializer_class = FormTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)  # raises ProtectedError if in use
        except ProtectedError:
            count = getattr(instance, "employees", None).count() if hasattr(instance, "employees") else 0
            return Response(
                {"detail": f"Cannot delete template because {count} employee record(s) use it."},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
