from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Issue


class IssueSerializer(serializers.ModelSerializer):
    assignee = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Issue
        fields = [
            'id',
            'title',
            'description',
            'status',
            'priority',
            'assignee',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'assignee', 'created_at', 'updated_at']
        extra_kwargs = {
            'title': {
                'max_length': 200,
                'trim_whitespace': True,
            },
            'description': {
                'allow_blank': True,
                'required': False,
                'trim_whitespace': False,
            },
        }

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError('The issue title cannot be blank.')
        return value.strip()

    def validate_description(self, value):
        return value.strip() if value else ''


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        trim_whitespace=False,
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'username': {
                'trim_whitespace': True,
            },
            'email': {
                'allow_blank': True,
                'required': False,
            },
        }

    def validate_username(self, value):
        if not value.strip():
            raise serializers.ValidationError('A username is required.')
        return value.strip()

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(list(error.messages))
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user
