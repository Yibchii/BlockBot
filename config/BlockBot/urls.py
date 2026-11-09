from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('home', views.index, name="home"),
    path('home/', views.index, name="home-slash"),
    path('editor', views.index, name="editor"),
    path('editor/', views.index, name="editor-slash"),
    path('login', views.index, name="login"),
    path('login/', views.index, name="login-slash"),
    path('student', views.index, name="student"),
    path('student/', views.index, name="student-slash"),
    path('mazebot2d', views.mazebot2d, name="mazebot2d"),
    path('mazebot2d/', views.mazebot2d, name="mazebot2d-slash"),
    # general API endpoints
    path('api/test/', views.test_api),
    path('api/robots/', views.get_robots),
    # Mazebot2D API simulator endpoints
    path('api/mazebot2d/grid/', views.get_mazebot2d_grid),
    path('api/mazebot2d/blocks', views.get_mazebot2d_blocks),
    # User API endpoints
    path('api/user/info/', views.get_user_info),
    path('api/user/login/', views.login_user),
    path('api/user/logout/', views.logout_user),
    path('api/user/register/student', views.register_student_user),
    path('api/user/register/instructor', views.register_instructor_user),
    path('api/files/files_of_user/', views.all_save_files_of_user),
    path('api/files/load_file/<str:save_file_name>/', views.fetch_save_file),
    path('api/files/save_file/<str:save_file_name>/<str:project_robot>/', views.save_to_file),
]