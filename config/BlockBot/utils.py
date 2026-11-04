from django.http import JsonResponse
from django.contrib.auth.models import Group, User

from .blockLoader import loadAllBlocks
from .models import UserProfile

#this is a placeholder for the future, right now it just returns a dummy string.
def loadDefaultBlocks():
    return loadAllBlocks()

def _register_user(request, group_name):
    if request.method != "POST":
        return JsonResponse({"message": "Invalid request method"}, status=400)

    email = request.POST.get("email")
    username = request.POST.get("username") or email
    password = request.POST.get("password")
    first_name = request.POST.get("first_name")
    last_name = request.POST.get("last_name")
    if not username or not password or not first_name or not last_name:
        return JsonResponse(
            {"message": "Username or email, password, first name, and last name are required"},
            status=400,
        )

    if User.objects.filter(username=username).exists():
        return JsonResponse({"message": "Username already exists"}, status=409)

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    profile_data = {
        "user": user,
        "display_name": f"{first_name} {last_name[0]}",
    }
    if email:
        profile_data["email"] = email
    UserProfile.objects.create(**profile_data)
    group, _ = Group.objects.get_or_create(name=group_name)
    user.groups.add(group)

    return JsonResponse({"message": "Registration successful"}, status=201)
