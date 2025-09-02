# employees/views.py
from rest_framework import generics, permissions
from django.db.models import Q
from .models import EmployeeRecord
from .serializers import EmployeeRecordSerializer

class EmployeeListCreateView(generics.ListCreateAPIView):
    serializer_class = EmployeeRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = EmployeeRecord.objects.all().select_related("template")
        params = self.request.query_params
        # Filter by template id if provided
        template_id = params.get("template")
        if template_id:
            qs = qs.filter(template_id=template_id)
        # Dynamic field filters: any query param that isn't known becomes a JSON key filter
        ignore = {"page", "page_size", "template", "ordering", "search"}
        for key, value in params.items():
            if key in ignore:
                continue
            # equality match; can extend with __gte/__lte logic
            qs = qs.filter(**{f"values__{key}": value})
        return qs

class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EmployeeRecord.objects.all()
    serializer_class = EmployeeRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
