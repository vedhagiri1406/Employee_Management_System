# employees/models.py
from django.db import models
from formsapp.models import FormTemplate

class EmployeeRecord(models.Model):
    template = models.ForeignKey(FormTemplate, on_delete=models.PROTECT, related_name="employees")
    values = models.JSONField(default=dict)  # {"<key>": value}
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
