import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from .models import Prompt, Tag
from .redis_client import increment_view_count, get_view_count, get_all_view_counts


def serialize_prompt(prompt, view_count=None):
    return {
        "id": prompt.id,
        "title": prompt.title,
        "content": prompt.content,
        "complexity": prompt.complexity,
        "tags": [{"id": t.id, "name": t.name} for t in prompt.tags.all()],
        "created_at": prompt.created_at.isoformat(),
        "view_count": view_count if view_count is not None else get_view_count(prompt.id),
    }


@method_decorator(csrf_exempt, name="dispatch")
class PromptListView(View):

    def get(self, request):
        tag_filter = request.GET.get("tag")
        prompts = Prompt.objects.prefetch_related("tags").all()

        if tag_filter:
            prompts = prompts.filter(tags__name__iexact=tag_filter)

        prompt_list = list(prompts)
        ids = [p.id for p in prompt_list]
        view_counts = get_all_view_counts(ids)

        data = [serialize_prompt(p, view_counts.get(p.id, 0)) for p in prompt_list]
        return JsonResponse(data, safe=False, status=200)

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)

        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({"error": "Invalid JSON body."}, status=400)

        title = body.get("title", "").strip()
        content = body.get("content", "").strip()
        complexity = body.get("complexity")
        tag_names = body.get("tags", [])

        errors = {}
        if not title:
            errors["title"] = "Title is required."
        elif len(title) < 3:
            errors["title"] = "Title must be at least 3 characters."

        if not content:
            errors["content"] = "Content is required."
        elif len(content) < 20:
            errors["content"] = "Content must be at least 20 characters."

        if complexity is None:
            errors["complexity"] = "Complexity is required."
        else:
            try:
                complexity = int(complexity)
                if not (1 <= complexity <= 10):
                    errors["complexity"] = "Complexity must be between 1 and 10."
            except (TypeError, ValueError):
                errors["complexity"] = "Complexity must be an integer."

        if errors:
            return JsonResponse({"errors": errors}, status=422)

        prompt = Prompt.objects.create(
            title=title,
            content=content,
            complexity=complexity,
        )

        if tag_names and isinstance(tag_names, list):
            for name in tag_names:
                name = str(name).strip().lower()
                if name:
                    tag, _ = Tag.objects.get_or_create(name=name)
                    prompt.tags.add(tag)

        return JsonResponse(serialize_prompt(prompt), status=201)


@method_decorator(csrf_exempt, name="dispatch")
class PromptDetailView(View):

    def get(self, request, pk):
        try:
            prompt = Prompt.objects.prefetch_related("tags").get(pk=pk)
        except Prompt.DoesNotExist:
            return JsonResponse({"error": "Prompt not found."}, status=404)

        view_count = increment_view_count(prompt.id)
        return JsonResponse(serialize_prompt(prompt, view_count), status=200)


@method_decorator(csrf_exempt, name="dispatch")
class TagListView(View):

    def get(self, request):
        tags = Tag.objects.all().values("id", "name")
        return JsonResponse(list(tags), safe=False, status=200)

    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)

        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({"error": "Invalid JSON body."}, status=400)

        name = body.get("name", "").strip().lower()
        if not name:
            return JsonResponse({"errors": {"name": "Tag name is required."}}, status=422)

        tag, created = Tag.objects.get_or_create(name=name)
        status_code = 201 if created else 200
        return JsonResponse({"id": tag.id, "name": tag.name}, status=status_code)