import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):

    def post(self, request):
        try:
            body = json.loads(request.body.decode("utf-8"))
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({"error": "Invalid JSON body."}, status=400)

        username = body.get("username", "").strip()
        password = body.get("password", "")

        if not username or not password:
            return JsonResponse({"error": "Username and password are required."}, status=400)

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            request.session.save()
            return JsonResponse({
                "message": "Login successful.",
                "user": {"id": user.id, "username": user.username},
            }, status=200)

        return JsonResponse({"error": "Invalid credentials. Check username and password."}, status=401)


@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(View):

    def post(self, request):
        logout(request)
        return JsonResponse({"message": "Logged out successfully."}, status=200)


@method_decorator(csrf_exempt, name="dispatch")
class MeView(View):

    def get(self, request):
        if request.user.is_authenticated:
            return JsonResponse({
                "authenticated": True,
                "user": {"id": request.user.id, "username": request.user.username},
            }, status=200)
        return JsonResponse({"authenticated": False, "user": None}, status=200)