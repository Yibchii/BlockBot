from django.contrib import admin

from .models import Classroom, CloudSavedProject, Robot, RobotBlockFile, UserProfile


admin.site.register(Classroom)
admin.site.register(CloudSavedProject)
admin.site.register(Robot)
admin.site.register(RobotBlockFile)
admin.site.register(UserProfile)
