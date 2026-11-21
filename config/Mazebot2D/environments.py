"""Preset mazes, each starting at (0, 0)."""

from .grid import MAZE_LAYOUT

ENVIRONMENTS = {
    "easy": ("Easy - Open field", ["         G"] + [" " * 10] * 9),
    "medium": ("Medium - Winding path", [
        "  #    # G",
        "  #    #  ",
        "  #    #  ",
        "  #    #  ",
        "  #    #  ",
        "       #  ",
        "       #  ",
        "  #       ",
        "  #       ",
        "  #       ",
    ]),
    "hard": ("Hard - Original maze", MAZE_LAYOUT),
}
