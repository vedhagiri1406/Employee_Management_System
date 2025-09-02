# employees/serializers.py
from rest_framework import serializers
from .models import EmployeeRecord
from formsapp.models import FormTemplate

class EmployeeRecordSerializer(serializers.ModelSerializer):
    template = serializers.PrimaryKeyRelatedField(queryset=FormTemplate.objects.all())
    values = serializers.DictField(child=serializers.CharField(), allow_empty=True)

    class Meta:
        model = EmployeeRecord
        fields = ["id", "template", "values", "created_at", "updated_at"]

    def validate(self, data):
        tpl: FormTemplate = data["template"]
        form_fields = {f["key"]: f for f in tpl.fields}
        # Required checks
        missing = [f["label"] for f in tpl.fields if f.get("required") and f["key"] not in data["values"]]
        if missing:
            raise serializers.ValidationError({"values": f"Missing required fields: {', '.join(missing)}"})
        # Type checks (basic)
        for key, raw in data["values"].items():
            f = form_fields.get(key)
            if not f:
                raise serializers.ValidationError({"values": f"Unknown field: {key}"})
            t = f["type"]
            if t == "number":
                try:
                    float(raw)
                except Exception:
                    raise serializers.ValidationError({key: "Must be a number"})
            # date/password/text can be accepted as strings here; tighten if needed
        return data
