from django.contrib import admin
from .models import Prompt, Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "created_at"]
    search_fields = ["name"]


@admin.register(Prompt)
class PromptAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "complexity", "created_at"]
    list_filter = ["complexity", "tags"]
    search_fields = ["title", "content"]
    filter_horizontal = ["tags"]