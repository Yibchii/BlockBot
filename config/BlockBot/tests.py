import json
import tempfile

from django.test import TestCase, override_settings
from django.contrib.auth.models import User

from .models import Classroom, CloudSavedProject, Robot
from .models import UserProfile


class MazeBot2DViewTestCase(TestCase):

	def test_register_user_uses_email_when_username_is_missing(self):
		response = self.client.post('/api/user/register/student', {
			"email": "jane@example.com",
			"password": "password",
			"first_name": "Jane",
			"last_name": "Doe",
		})

		self.assertEqual(response.status_code, 201)
		user = User.objects.get(username="jane@example.com")
		profile = UserProfile.objects.get(user=user)
		self.assertEqual(user.username, "jane@example.com")
		self.assertEqual(profile.email, "jane@example.com")

	def test_user_info_api_rejects_anonymous_users(self):
		response = self.client.get('/api/user/info/')

		self.assertEqual(response.status_code, 401)

	def test_user_info_api_returns_display_name_for_logged_in_users(self):
		user = User.objects.create_user(username="jane", password="password")
		UserProfile.objects.create(user=user, display_name="Jane Doe")
		self.client.force_login(user)

		response = self.client.get('/api/user/info/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json(), {
			"username": "jane",
			"display_name": "Jane Doe",
		})

	def test_robot_api_lists_database_robots(self):
		Robot.objects.create(id=1, name="MazeBot2D", robot_type=Robot.RobotType.SIMULATED)

		response = self.client.get('/api/robots/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()["robots"], [{
			"id": 1,
			"name": "MazeBot2D",
			"robot_type": "simulated",
		}])

	def test_mazebot2d_displays_ascii_grid_and_controls(self):
		response = self.client.get('/mazebot2d')

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, "@# #G     ")
		self.assertContains(response, 'name="command" value="left"')
		self.assertContains(response, 'name="command" value="right"')
		self.assertContains(response, 'name="command" value="up"')
		self.assertContains(response, 'name="command" value="down"')
		self.assertContains(response, 'name="command" value="reset"')

	def test_movement_command_updates_robot_position(self):
		response = self.client.post('/mazebot2d', {"command": "down"})

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, "@# #      ", count=0)
		self.assertContains(response, "@# ", count=1)

	def test_reset_command_returns_robot_to_default_position(self):
		self.client.post('/mazebot2d', {"command": "right"})
		response = self.client.post('/mazebot2d', {"command": "reset"})

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, "@# #G     ")

	def test_trailing_slash_url_displays_page(self):
		response = self.client.get('/mazebot2d/')

		self.assertEqual(response.status_code, 200)

	def test_api_endpoint_succeeds(self):
		response = self.client.get('/api/test/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json(), {'message': 'Django is connected'})

	def test_mazebot2d_grid_api_succeeds(self):
		response = self.client.get('/api/mazebot2d/grid/', {'x': 0, 'y': 0})

		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertEqual(data['header'], 'Mazebot2D Grid')
		self.assertIn('grid', data)

		rows = data['grid'].splitlines()
		self.assertEqual(len(rows), 12)
		self.assertEqual(rows[0], '+----------+')
		self.assertEqual(rows[-1], '+----------+')
		self.assertEqual(rows[1][1], '@')

	def test_mazebot2d_grid_api_marks_robot_on_goal(self):
		response = self.client.get('/api/mazebot2d/grid/', {'x': 4, 'y': 0})

		self.assertEqual(response.status_code, 200)
		rows = response.json()['grid'].splitlines()
		self.assertEqual(rows[1][5], '*')

class ClassroomApiTestCase(TestCase):
	def test_create_classroom_rejects_anonymous_users(self):
		response = self.client.post('/api/classroom/create/', {"name": "Period 1"})

		self.assertEqual(response.status_code, 401)

	def test_create_classroom_makes_user_the_owner(self):
		user = User.objects.create_user(username="teacher", password="password")
		profile = UserProfile.objects.create(user=user, display_name="Ms. Smith")
		self.client.force_login(user)

		response = self.client.post('/api/classroom/create/', {"name": "Period 1"})

		self.assertEqual(response.status_code, 200)
		classroom = Classroom.objects.get(id=response.json()["classroom_id"])
		self.assertEqual(classroom.name, "Period 1")
		self.assertEqual(classroom.owner, profile)
		self.assertIn(profile, classroom.members.all())

	def test_classroom_info_rejects_users_not_in_classroom(self):
		teacher = User.objects.create_user(username="teacher", password="password")
		teacher_profile = UserProfile.objects.create(user=teacher, display_name="Ms. Smith")
		classroom = Classroom.objects.create(name="Period 1", owner=teacher_profile)
		classroom.members.add(teacher_profile)

		outsider = User.objects.create_user(username="outsider", password="password")
		UserProfile.objects.create(user=outsider, display_name="Outsider")
		self.client.force_login(outsider)

		response = self.client.get(f'/api/classroom/{classroom.id}/info/')

		self.assertEqual(response.status_code, 403)

	def test_create_classroom_requires_a_name(self):
		user = User.objects.create_user(username="teacher", password="password")
		UserProfile.objects.create(user=user, display_name="Ms. Smith")
		self.client.force_login(user)

		response = self.client.post('/api/classroom/create/', {})

		self.assertEqual(response.status_code, 400)
		self.assertFalse(Classroom.objects.exists())

	def test_owner_can_view_classroom_info(self):
		teacher = User.objects.create_user(username="teacher", password="password")
		teacher_profile = UserProfile.objects.create(user=teacher, display_name="Ms. Smith")
		classroom = Classroom.objects.create(name="Period 1", owner=teacher_profile)
		classroom.members.add(teacher_profile)
		self.client.force_login(teacher)

		response = self.client.get(f'/api/classroom/{classroom.id}/info/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json(), {
			"classroom": {
				"id": classroom.id,
				"name": "Period 1",
				"owner": "Ms. Smith",
				"members": ["Ms. Smith"],
			}
		})

	def test_member_can_view_classroom_info(self):
		teacher = User.objects.create_user(username="teacher", password="password")
		teacher_profile = UserProfile.objects.create(user=teacher, display_name="Ms. Smith")
		classroom = Classroom.objects.create(name="Period 1", owner=teacher_profile)
		classroom.members.add(teacher_profile)

		student = User.objects.create_user(username="student", password="password")
		student_profile = UserProfile.objects.create(user=student, display_name="Sam")
		classroom.members.add(student_profile)
		self.client.force_login(student)

		response = self.client.get(f'/api/classroom/{classroom.id}/info/')

		self.assertEqual(response.status_code, 200)
		info = response.json()["classroom"]
		self.assertEqual(info["name"], "Period 1")
		self.assertEqual(info["owner"], "Ms. Smith")
		self.assertCountEqual(info["members"], ["Ms. Smith", "Sam"])

	def test_classroom_info_returns_404_for_missing_classroom(self):
		user = User.objects.create_user(username="teacher", password="password")
		UserProfile.objects.create(user=user, display_name="Ms. Smith")
		self.client.force_login(user)

		response = self.client.get('/api/classroom/999/info/')

		self.assertEqual(response.status_code, 404)
		self.assertEqual(response.json()["message"], "Classroom not found")

	def test_owned_classrooms_only_lists_your_classrooms(self):
		teacher = User.objects.create_user(username="teacher", password="password")
		teacher_profile = UserProfile.objects.create(user=teacher, display_name="Ms. Smith")
		period_1 = Classroom.objects.create(name="Period 1", owner=teacher_profile)
		period_2 = Classroom.objects.create(name="Period 2", owner=teacher_profile)

		other_teacher = User.objects.create_user(username="other", password="password")
		other_profile = UserProfile.objects.create(user=other_teacher, display_name="Mr. Lee")
		Classroom.objects.create(name="Mr. Lee's Class", owner=other_profile)

		self.client.force_login(teacher)

		response = self.client.get('/api/classroom/owned/')

		self.assertEqual(response.status_code, 200)
		self.assertCountEqual(response.json()["classrooms"], [
			{"id": period_1.id, "name": "Period 1"},
			{"id": period_2.id, "name": "Period 2"},
		])


class ProjectFileApiTestCase(TestCase):

	def setUp(self):
		# Save project files to a temporary folder instead of the real one
		media_dir = tempfile.TemporaryDirectory()
		self.addCleanup(media_dir.cleanup)
		media_settings = override_settings(MEDIA_ROOT=media_dir.name)
		media_settings.enable()
		self.addCleanup(media_settings.disable)

		self.user = User.objects.create_user(username="student", password="password")
		UserProfile.objects.create(user=self.user, display_name="Student")
		self.robot = Robot.objects.create(id=1, name="MazeBot2D", robot_type=Robot.RobotType.SIMULATED)
		self.client.force_login(self.user)

	def test_saved_project_loads_with_same_content(self):
		workspace = {"blocks": {"languageVersion": 0, "blocks": [{"type": "move_forward"}]}}

		save_response = self.client.post(
			f'/api/files/save_file/MyMaze/{self.robot.id}/',
			data=json.dumps(workspace),
			content_type="application/json",
		)
		self.assertEqual(save_response.status_code, 201)

		load_response = self.client.get('/api/files/load_file/MyMaze/')

		self.assertEqual(load_response.status_code, 200)
		self.assertEqual(json.loads(load_response.json()["content"]), workspace)

	def test_loading_missing_project_returns_404(self):
		response = self.client.get('/api/files/load_file/NotARealProject/')

		self.assertEqual(response.status_code, 404)

	def test_save_rejects_anonymous_users(self):
		self.client.logout()

		response = self.client.post(
			f'/api/files/save_file/MyMaze/{self.robot.id}/',
			data=json.dumps({"blocks": {}}),
			content_type="application/json",
		)

		self.assertEqual(response.status_code, 401)
		self.assertFalse(CloudSavedProject.objects.exists())
