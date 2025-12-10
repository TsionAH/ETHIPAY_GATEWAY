from django.urls import path
from .views import UserViewSet

user_list = UserViewSet.as_view({
    'post': 'register'
})

urlpatterns = [
    path('register/', user_list, name='user-register'),
]
