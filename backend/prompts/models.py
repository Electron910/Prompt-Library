from django.db import models


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Prompt(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    complexity = models.IntegerField()
    tags = models.ManyToManyField(Tag, blank=True, related_name="prompts")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def clean(self):
        from django.core.exceptions import ValidationError
        errors = {}
        if self.title and len(self.title.strip()) < 3:
            errors["title"] = "Title must be at least 3 characters."
        if self.content and len(self.content.strip()) < 20:
            errors["content"] = "Content must be at least 20 characters."
        if self.complexity is not None:
            if not (1 <= self.complexity <= 10):
                errors["complexity"] = "Complexity must be between 1 and 10."
        if errors:
            raise ValidationError(errors)