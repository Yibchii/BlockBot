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
		return f"{self.name} {self.robot_type}"

class RobotBlockFile(models.Model):
    robot = models.ForeignKey(Robot, on_delete=models.CASCADE, related_name="block_files")
    filename = models.CharField(max_length=255)
    def __str__(self):
        return f"{self.robot}: {self.filename}"

class UserProfile(models.Model):
	user = models.OneToOneField("auth.User", on_delete=models.CASCADE, related_name="profile")
	display_name = models.CharField(max_length=255, blank=True)
	email = models.EmailField(max_length=255, blank=True)
	def __str__(self):
		return f"{self.user.username} - {self.display_name}"