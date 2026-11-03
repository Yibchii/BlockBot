from django.contrib import admin

from .models import Robot, RobotBlockFile, UserProfile


admin.site.register(Robot)
admin.site.register(RobotBlockFile)
admin.site.register(UserProfile)
