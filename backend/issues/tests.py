from django.contrib.auth.models import User
from django.test import TestCase

from .serializers import IssueSerializer, UserSerializer


class IssueSerializerTests(TestCase):
    def test_title_is_trimmed_and_description_defaults_to_empty_string(self):
        serializer = IssueSerializer(
            data={
                'title': '  Fix login bug  ',
                'description': '',
                'status': 'TODO',
                'priority': 'HIGH',
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data['title'], 'Fix login bug')
        self.assertEqual(serializer.validated_data['description'], '')

    def test_blank_title_is_rejected(self):
        serializer = IssueSerializer(
            data={
                'title': '   ',
                'description': '',
                'status': 'TODO',
                'priority': 'MEDIUM',
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)


class UserSerializerTests(TestCase):
    def test_creates_user_with_hashed_password(self):
        serializer = UserSerializer(
            data={
                'username': '  testuser  ',
                'email': 'test@example.com',
                'password': 'CorrectHorseBatteryStaple!7',
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('CorrectHorseBatteryStaple!7'))

    def test_duplicate_username_is_rejected(self):
        User.objects.create_user(username='existing', password='OldPassword!123')
        serializer = UserSerializer(
            data={
                'username': 'existing',
                'email': '',
                'password': 'CorrectHorseBatteryStaple!7',
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)
