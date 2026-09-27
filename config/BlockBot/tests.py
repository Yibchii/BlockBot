from django.test import TestCase


class MazeBot2DViewTestCase(TestCase):
	def test_mazebot2d_displays_ascii_grid_and_controls(self):
		response = self.client.get('/mazebot2d')

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, "@# #      ")
		self.assertContains(response, 'name="command" value="left"')
		self.assertContains(response, 'name="command" value="right"')
		self.assertContains(response, 'name="command" value="up"')
		self.assertContains(response, 'name="command" value="down"')

	def test_movement_command_updates_robot_position(self):
		response = self.client.post('/mazebot2d', {"command": "down"})

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, "@# #      ", count=0)
		self.assertContains(response, "@# ", count=1)

	def test_trailing_slash_url_displays_page(self):
		response = self.client.get('/mazebot2d/')

		self.assertEqual(response.status_code, 200)
