from django.urls import path
from .views import PromptListView, PromptDetailView, TagListView

urlpatterns = [
    path("prompts/", PromptListView.as_view(), name="prompt-list"),
    path("prompts/<int:pk>/", PromptDetailView.as_view(), name="prompt-detail"),
    path("tags/", TagListView.as_view(), name="tag-list"),
]