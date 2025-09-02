# formsapp/serializers.py
from rest_framework import serializers
from django.utils.text import slugify
from .models import FormTemplate

ALLOWED_TYPES = {"text", "number", "date", "password"}  # extend if needed

class FieldItemSerializer(serializers.Serializer):
    id = serializers.CharField()
    label = serializers.CharField()
    key = serializers.CharField(required=False)
    type = serializers.ChoiceField(choices=[(t, t) for t in ALLOWED_TYPES])
    required = serializers.BooleanField(default=False)
    order = serializers.IntegerField()

    def validate(self, data):
        data["key"] = data.get("key") or slugify(data["label"]).replace("-", "_")
        return data

class FormTemplateSerializer(serializers.ModelSerializer):
    fields = FieldItemSerializer(many=True)

    class Meta:
        model = FormTemplate
        fields = ["id", "name", "fields", "created_at", "updated_at"]

    def create(self, validated_data):
        fields = validated_data.pop("fields", [])
        tpl = FormTemplate.objects.create(created_by=self.context["request"].user, **validated_data)
        tpl.fields = fields
        tpl.save()
        return tpl

    def update(self, instance, validated_data):
        fields = validated_data.pop("fields", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if fields is not None:
            instance.fields = fields
        instance.save()
        return instance
