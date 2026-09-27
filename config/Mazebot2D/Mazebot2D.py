from .grid import Grid


class Mazebot2D:
    """A robot that moves within a bounded 10x10 grid."""

    GRID_SIZE = 10
    COMMANDS = {"up", "down", "left", "right"}

    def __init__(self, x=0, y=0, grid=None):
        self._validate_position(x, y)
        self.grid = grid or Grid()
        if not self.grid.can_navigate(x, y):
            raise ValueError("robot cannot start on a blocked cell")
        self.x = x
        self.y = y

    @property
    def position(self):
        """Return the robot's current position as an (x, y) tuple."""
        return self.x, self.y

    def move_up(self):
        self._move_to(self.x, max(self.y - 1, 0))
        return self.position

    def move_down(self):
        self._move_to(self.x, min(self.y + 1, self.GRID_SIZE - 1))
        return self.position

    def move_left(self):
        self._move_to(max(self.x - 1, 0), self.y)
        return self.position

    def move_right(self):
        self._move_to(min(self.x + 1, self.GRID_SIZE - 1), self.y)
        return self.position

    def execute(self, command):
        """Execute one of the four supported movement commands."""
        if command not in self.COMMANDS:
            raise ValueError(
                f"Unknown command {command!r}; expected one of "
                f"{sorted(self.COMMANDS)}"
            )

        return getattr(self, f"move_{command}")()

    def _move_to(self, x, y):
        if self.grid.can_navigate(x, y):
            self.x = x
            self.y = y

    @classmethod
    def _validate_position(cls, x, y):
        if not all(isinstance(value, int) and not isinstance(value, bool) for value in (x, y)):
            raise TypeError("x and y must be integers")
        if not all(0 <= value < cls.GRID_SIZE for value in (x, y)):
            raise ValueError(f"x and y must be between 0 and {cls.GRID_SIZE - 1}")