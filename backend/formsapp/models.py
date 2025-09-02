# formsapp/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class FormTemplate(models.Model):
    name = models.CharField(max_length=120, unique=True)
    fields = models.JSONField(default=list)  # [{id,label,key,type,required,order}]
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.name
