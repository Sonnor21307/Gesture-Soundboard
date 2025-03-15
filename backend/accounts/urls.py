from django.urls import path

from . import views

app_name = 'accounts'

urlpatterns = [
    path('create', views.signup, name='fart'),
    path('login', views.login, name='login'),
    path('update', views.update_user, name='update'),
    path('<str:username>/delete', views.delete_user, name='logout'),
]