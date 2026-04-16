from django.conf import settings


class CorsMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def _get_allowed_origin(self, request):
        origin = request.META.get("HTTP_ORIGIN", "")
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:4200")
        allowed = [
            "http://localhost:4200",
            "http://127.0.0.1:4200",
            frontend_url,
        ]
        if origin in allowed:
            return origin
        return frontend_url

    def __call__(self, request):
        allowed_origin = self._get_allowed_origin(request)

        if request.method == "OPTIONS":
            from django.http import HttpResponse
            response = HttpResponse()
            response["Access-Control-Allow-Origin"] = allowed_origin
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-CSRFToken"
            response["Access-Control-Allow-Credentials"] = "true"
            response["Access-Control-Max-Age"] = "86400"
            response.status_code = 200
            return response

        response = self.get_response(request)
        response["Access-Control-Allow-Origin"] = allowed_origin
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-CSRFToken"
        response["Access-Control-Allow-Credentials"] = "true"
        return response