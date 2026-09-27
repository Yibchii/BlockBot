import unittest

from .grid import CellType, Grid
from .Mazebot2D import Mazebot2D


class RobotTestCase(unittest.TestCase):
    def test_commands_move_robot(self):
        layout = [[" " for _ in range(10)] for _ in range(10)]
        robot = Mazebot2D(1, 1, grid=Grid(layout=layout))

        self.assertEqual(robot.move_right(), (2, 1))
        self.assertEqual(robot.move_up(), (2, 0))
        self.assertEqual(robot.move_left(), (1, 0))
        self.assertEqual(robot.move_down(), (1, 1))

    def test_execute_runs_command_by_name(self):
        layout = [[" " for _ in range(10)] for _ in range(10)]
        robot = Mazebot2D(grid=Grid(layout=layout))

        self.assertEqual(robot.execute("right"), (1, 0))

    def test_robot_stays_inside_grid(self):
        layout = [[" " for _ in range(10)] for _ in range(10)]
        robot = Mazebot2D(9, 9, grid=Grid(layout=layout))

        self.assertEqual(robot.move_down(), (9, 9))
        self.assertEqual(robot.move_right(), (9, 9))

        robot = Mazebot2D(0, 0)
        self.assertEqual(robot.move_up(), (0, 0))
        self.assertEqual(robot.move_left(), (0, 0))

    def test_unknown_command_raises_error(self):
        with self.assertRaises(ValueError):
            Mazebot2D().execute("jump")

    def test_grid_stores_navigable_and_blocked_cells(self):
        grid = Grid()
        grid.set_cell(1, 0, CellType.BLOCKED)

        self.assertEqual(grid.get_cell(0, 0), CellType.NAVIGABLE)
        self.assertEqual(grid.get_cell(1, 0), CellType.BLOCKED)
        self.assertFalse(grid.can_navigate(1, 0))

    def test_robot_cannot_move_into_blocked_cell(self):
        grid = Grid()
        grid.set_cell(1, 0, CellType.BLOCKED)
        robot = Mazebot2D(grid=grid)

        self.assertEqual(robot.move_right(), (0, 0))


if __name__ == "__main__":
    unittest.main()