from django.shortcuts import render

from Mazebot2D import CellType, Grid, Mazebot2D

# Create your views here.
def index(request):
    return render(request, 'BlockBot/index.html')


def mazebot2d(request):
    grid = Grid()
    position = request.session.get("mazebot2d_position", [0, 0])
    robot = Mazebot2D(position[0], position[1], grid=grid)

    if request.method == "POST":
        command = request.POST.get("command")
        if command in Mazebot2D.COMMANDS:
            robot.execute(command)
            request.session["mazebot2d_position"] = list(robot.position)

    return render(
        request,
        "BlockBot/mazebot2d.html",
        {"ascii_grid": _ascii_grid(grid, robot)},
    )


def _ascii_grid(grid, robot):
    rows = []
    rows.append("+" + "-" * grid.SIZE + "+")
    for y in range(grid.SIZE):
        row = []
        row.append("|")
        for x in range(grid.SIZE):
            if (x, y) == robot.position:
                row.append("@")
            elif grid.get_cell(x, y) == CellType.BLOCKED:
                row.append("#")
            else:
                row.append(" ")
        row.append("|")
        rows.append("".join(row))
    rows.append("+" + "-" * grid.SIZE + "+")

    return "\n".join(rows)