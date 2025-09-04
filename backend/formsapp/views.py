from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db.models.deletion import ProtectedError
from rest_framework.decorators import action
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
    
    @action(detail=True, methods=['get','put'], url_path=r'fields/(?P<field_id>[^/.]+)')
    def field(self, request, pk=None, field_id=None):
        tpl = self.get_object()
        items = tpl.fields or []
        # find item by its 'id'
        idx = next((i for i, f in enumerate(items) if f.get('id') == field_id), None)
        if idx is None:
            return Response({"detail": "Field not found."}, status=404)

        if request.method == 'GET':
            return Response(items[idx])

        # PUT: replace/update field item
        items[idx] = {**items[idx], **request.data}
        tpl.fields = items
        tpl.save()
        return Response(items[idx])
