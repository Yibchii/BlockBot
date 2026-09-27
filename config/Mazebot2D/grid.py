from enum import Enum


class CellType(Enum):
    NAVIGABLE = "navigable"
    BLOCKED = "blocked"


MAZE_LAYOUT = [
    [" ", "#", " ", "#", " ", " ", " ", " ", " ", " "],
    [" ", "#", " ", "#", "#", "#", "#", "#", " ", " "],
    [" ", "#", " ", " ", " ", " ", "#", " ", " ", " "],
    [" ", "#", " ", "#", " ", " ", "#", " ", " ", " "],
    [" ", "#", " ", "#", " ", " ", "#", " ", " ", " "],
    [" ", "#", " ", "#", " ", "#", "#", "#", " ", "#"],
    [" ", "#", " ", "#", " ", " ", "#", " ", " ", "#"],
    [" ", "#", " ", "#", " ", " ", " ", " ", " ", "#"],
    [" ", " ", " ", "#", " ", " ", " ", " ", " ", "#"],
    [" ", " ", " ", "#", " ", " ", "#", "#", "#", "#"],
]

CELL_TYPES = {
    " ": CellType.NAVIGABLE,
    "#": CellType.BLOCKED,
}


class Grid:
    """A 10x10 grid that stores the state of every cell."""

    SIZE = 10
    DEFAULT_POSITION = (0, 0)

    def __init__(self, layout=None):
        layout = layout or MAZE_LAYOUT
        if len(layout) != self.SIZE or any(len(row) != self.SIZE for row in layout):
            raise ValueError(f"layout must be a {self.SIZE}x{self.SIZE} list")
        try:
            self._cells = [[CELL_TYPES[cell] for cell in row] for row in layout]
        except KeyError as error:
            raise ValueError(f"unknown cell symbol: {error.args[0]!r}") from error

    def get_cell(self, x, y):
        self._validate_position(x, y)
        return self._cells[y][x]

    def set_cell(self, x, y, cell_type):
        self._validate_position(x, y)
        if not isinstance(cell_type, CellType):
            raise TypeError("cell_type must be a CellType")
        self._cells[y][x] = cell_type

    def can_navigate(self, x, y):
        return self.get_cell(x, y) == CellType.NAVIGABLE

    @classmethod
    def _validate_position(cls, x, y):
        if not all(isinstance(value, int) and not isinstance(value, bool) for value in (x, y)):
            raise TypeError("x and y must be integers")
        if not all(0 <= value < cls.SIZE for value in (x, y)):
            raise ValueError(f"x and y must be between 0 and {cls.SIZE - 1}")