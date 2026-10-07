from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('mazebot2d', views.mazebot2d, name="mazebot2d"),
    path('mazebot2d/', views.mazebot2d, name="mazebot2d-slash"),
    path('api/test/', views.test_api),
    path('api/mazebot2d/grid/', views.get_mazebot2d_grid),
]