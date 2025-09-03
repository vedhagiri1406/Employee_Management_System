from rest_framework import serializers
from django.utils.text import slugify
from .models import FormTemplate

ALLOWED_TYPES = {"text", "number", "date", "password"}

class FieldItemSerializer(serializers.Serializer):
    id = serializers.CharField()
    label = serializers.CharField()
    key = serializers.CharField(required=False)
    type = serializers.ChoiceField(choices=[(t, t) for t in ALLOWED_TYPES])
    required = serializers.BooleanField(default=False)
    order = serializers.IntegerField()

    def validate(self, data):
        # Auto-generate key from label if not provided
        data["key"] = data.get("key") or slugify(data["label"]).replace("-", "_")
        return data

class FormTemplateSerializer(serializers.ModelSerializer):
    fields = FieldItemSerializer(many=True)

    class Meta:
        model = FormTemplate
        fields = ["id", "name", "fields", "created_at", "updated_at"]

    def validate(self, data):
        # Ensure keys are unique
        raw_fields = data.get("fields", getattr(self.instance, "fields", []))
        keys = []
        for f in raw_fields:
            key = f.get("key") or slugify(f["label"]).replace("-", "_")
            keys.append(key)
        if len(keys) != len(set(keys)):
            raise serializers.ValidationError({"fields": "Field keys must be unique."})
        return data

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
