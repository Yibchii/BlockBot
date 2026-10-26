from django.test import TestCase
from .models import Robot


class MazeBot2DViewTestCase(TestCase):
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
