import email

from django.db import models

class Robot(models.Model):
	class RobotType(models.TextChoices):
		SIMULATED = "simulated", "Simulated"
		PHYSICAL = "physical", "Physical"

	id = models.IntegerField(primary_key=True)
	name = models.CharField(max_length=255)
	robot_type = models.CharField(max_length=9, choices=RobotType.choices)
	def __str__(self):
		return f"{self.name} - {self.robot_type}"

class RobotBlockFile(models.Model):
    robot = models.ForeignKey(Robot, on_delete=models.CASCADE, related_name="block_files")
    filename = models.CharField(max_length=255)
    def __str__(self):
        return f"{self.robot.name} - {self.filename}"

class UserProfile(models.Model):
	user = models.OneToOneField("auth.User", on_delete=models.CASCADE, related_name="profile")
	display_name = models.CharField(max_length=255, blank=True)
	email = models.EmailField(max_length=255, blank=True)
	def __str__(self):
		return f"{self.user.username} - {self.display_name}"

class Classroom(models.Model):
	id = models.AutoField(primary_key=True)
	name = models.CharField(max_length=255)
	owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="owned_classrooms")
	members = models.ManyToManyField(UserProfile, related_name="classrooms")
	def __str__(self):
		return f"{self.name} - {self.owner.display_name}"

class CloudSavedProject(models.Model):
	id = models.AutoField(primary_key=True)
	name = models.CharField(max_length=255)
	owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="cloud_projects")
	robot = models.ForeignKey(Robot, on_delete=models.CASCADE, related_name="cloud_projects")
	savefile = models.FileField(upload_to="user_data/cloud_projects/")
	def __str__(self):
		return f"{self.name} - {self.owner.display_name} - {self.robot.name} - {self.savefile}"
