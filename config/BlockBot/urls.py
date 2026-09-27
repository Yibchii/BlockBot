from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('mazebot2d', views.mazebot2d, name="mazebot2d"),
    path('mazebot2d/', views.mazebot2d, name="mazebot2d-slash"),
]