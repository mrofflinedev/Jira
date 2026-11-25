from django.contrib.auth.models import User
from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny
from .models import Issue
from .serializers import IssueSerializer, UserSerializer

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

    def get_queryset(self):
        return Issue.objects.filter(assignee=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(assignee=self.request.user)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
