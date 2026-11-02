import json
from pathlib import Path

from django.shortcuts import render

from .utils import loadDefaultBlocks
from Mazebot2D import CellType, Grid, Mazebot2D
from django.http import JsonResponse
from .models import Robot

# Web Pages
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
        {
            "ascii_grid": _ascii_grid(grid, robot),
            "blocks_test": loadDefaultBlocks(),
        },
    )

#Utility library
def _ascii_grid(grid, robot):
    rows = []
    rows.append("+" + "-" * grid.SIZE + "+")
    for y in range(grid.SIZE):
        row = []
        row.append("|")
        for x in range(grid.SIZE):
            if (x, y) == robot.position:
                row.append("*" if grid.get_cell(x, y) == CellType.GOAL else "@")
            elif grid.get_cell(x, y) == CellType.BLOCKED:
                row.append("#")
            elif grid.get_cell(x, y) == CellType.GOAL:
                row.append("G")
            else:
                row.append(" ")
        row.append("|")
        rows.append("".join(row))
    rows.append("+" + "-" * grid.SIZE + "+")

    return "\n".join(rows)

# API Endpoints
def test_api(request):
    return JsonResponse({"message" : "Django is connected"})

def get_robots(request):
    robots = list(
        Robot.objects.values("id", "name", "robot_type")
    )
    return JsonResponse({"robots": robots})

def get_mazebot2d_grid(request):
    x = int(request.GET.get("x", 0))
    y = int(request.GET.get("y", 0))
    response_data = {
        "header": "Mazebot2D Grid",
        "grid": _ascii_grid(Grid(), Mazebot2D(x, y, grid=Grid())),
    }
    return JsonResponse(response_data)

def get_mazebot2d_blocks(request):
    json_file = Path(__file__).resolve().parent / "block_files" / "mazebot2d.json"
    print(f"Loading JSON file: {json_file}")
    with open(json_file, "r", encoding="utf-8") as file:
        response_data = json.load(file)

    return JsonResponse(response_data)